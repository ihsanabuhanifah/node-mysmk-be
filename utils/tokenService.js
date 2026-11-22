// Layanan token: access token (JWT, umur pendek) + refresh token (acak, umur panjang, dirotasi).
const crypto = require("crypto");
const JWT = require("jsonwebtoken");
const { Op, QueryTypes } = require("sequelize");
const models = require("../models");

const ACCESS_TTL = process.env.JWT_ACCESS_EXPIRESIN || "30m";
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
// Toleransi untuk 2 tab yang me-refresh bersamaan dengan token yang sama
const ROTATE_GRACE_MS = 30 * 1000;

const hash = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

/**
 * Bangun isi access token untuk user + role login (sama persis dengan isi token saat login).
 * loginAs null -> token minimal (dipakai login Google / pendaftaran).
 */
async function buildAccessPayload(user, loginAs) {
  const roleId = loginAs === null || loginAs === undefined ? null : Number(loginAs);
  if (roleId === null) {
    return { payload: { email: user.email, name: user.name, id: user.id }, extra: {} };
  }

  const roleName = await models.role.findByPk(roleId);
  let parent;
  let siswa;
  let guru;
  let allRole = [];
  let KelasStudent = [];

  if (roleId === 8) {
    parent = await models.parent.findOne({
      attributes: ["id", "nama_wali", "user_id", "student_id", "hubungan", "nama_siswa"],
      where: { user_id: user.id },
    });
  } else if (roleId === 9) {
    siswa = await models.student.findOne({ attributes: ["id"], where: { user_id: user.id } });
  } else {
    guru = await models.teacher.findOne({ attributes: ["id"], where: { user_id: user.id } });
    const roles = await models.user_role.findAll({
      where: { user_id: user.id },
      include: [{ model: models.role, as: "role" }],
    });
    allRole = roles.map((r) => r.role?.role_name).filter(Boolean);
  }

  if (parent?.student_id) {
    KelasStudent = await models.sequelize.query(
      `SELECT a.semester, b.nama_tahun_ajaran AS ta_id
         FROM kelas_students AS a LEFT JOIN ta AS b ON (a.ta_id = b.id)
        WHERE a.student_id = :sid AND a.status = 1`,
      { type: QueryTypes.SELECT, replacements: { sid: parent.student_id } }
    );
  }

  const payload = {
    email: user.email,
    name: user.name,
    id: user.id,
    role: roleName?.role_name,
    roleId: roleId,
    StudentId: parent?.student_id,
    nama_siswa: parent?.nama_siswa,
    student_id: siswa?.id,
    teacher_id: guru?.id,
    walsan_id: parent?.id,
    allRole,
    semesterAktif: parent?.student_id !== undefined ? KelasStudent[0]?.semester : "",
    tahunAjaranAktif: parent?.student_id !== undefined ? KelasStudent[0]?.ta_id : "",
  };
  return { payload, extra: { roleName, parent, KelasStudent } };
}

const signAccess = (payload) =>
  JWT.sign(payload, process.env.JWT_SECRET_ACCESS_TOKEN, { expiresIn: ACCESS_TTL });

async function issueRefresh(userId, loginAs, userAgent) {
  const token = crypto.randomBytes(48).toString("base64url");
  await models.refresh_token.create({
    user_id: userId,
    token_hash: hash(token),
    login_as: loginAs === undefined ? null : loginAs,
    expires_at: new Date(Date.now() + REFRESH_DAYS * 24 * 3600 * 1000),
    user_agent: userAgent ? String(userAgent).slice(0, 255) : null,
  });
  return token;
}

async function revokeAllUser(userId, reason) {
  await models.refresh_token.update(
    { revoked_at: new Date(), revoked_reason: reason },
    { where: { user_id: userId, revoked_at: null } }
  );
}

async function revokeToken(token, reason = "logout") {
  if (!token) return 0;
  const [n] = await models.refresh_token.update(
    { revoked_at: new Date(), revoked_reason: reason },
    { where: { token_hash: hash(token), revoked_at: null } }
  );
  return n;
}

/**
 * Tukar refresh token -> pasangan token baru (rotasi).
 * @returns { ok:true, user, loginAs, refreshToken } | { ok:false, code, msg }
 */
async function rotateRefresh(token, userAgent) {
  if (!token) return { ok: false, code: 401, msg: "Refresh token tidak ada" };
  const row = await models.refresh_token.findOne({ where: { token_hash: hash(token) } });
  if (!row) return { ok: false, code: 401, msg: "Refresh token tidak valid" };

  if (row.revoked_at) {
    const baruDirotasi =
      row.revoked_reason === "rotated" &&
      Date.now() - new Date(row.revoked_at).getTime() < ROTATE_GRACE_MS;
    if (!baruDirotasi) {
      // Token lama dipakai ulang -> kemungkinan dicuri: cabut semua sesi user
      if (row.revoked_reason === "rotated") await revokeAllUser(row.user_id, "reuse");
      return { ok: false, code: 401, msg: "Sesi sudah berakhir, silakan login kembali" };
    }
  }
  if (new Date(row.expires_at) < new Date()) {
    return { ok: false, code: 401, msg: "Sesi sudah berakhir, silakan login kembali" };
  }

  const user = await models.user.findByPk(row.user_id);
  if (!user) return { ok: false, code: 401, msg: "Akun tidak ditemukan" };

  const { isAkunDiblokir, pesanAkunDiblokir } = require("./statusAkun");
  if (isAkunDiblokir(user.status)) {
    await revokeAllUser(user.id, "blocked");
    return { ok: false, code: 401, msg: pesanAkunDiblokir(user.status) };
  }

  if (!row.revoked_at) {
    await row.update({ revoked_at: new Date(), revoked_reason: "rotated" });
  }
  const refreshToken = await issueRefresh(user.id, row.login_as, userAgent);
  return { ok: true, user, loginAs: row.login_as, refreshToken };
}

// Bersihkan token kedaluwarsa / dicabut lebih dari 30 hari
async function cleanupTokens() {
  const batas = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  return models.refresh_token.destroy({
    where: {
      [Op.or]: [{ expires_at: { [Op.lt]: new Date() } }, { revoked_at: { [Op.lt]: batas } }],
    },
  });
}

/** Objek user aman untuk dikirim ke client (tanpa password & token). */
function userAman(user) {
  const u = typeof user?.toJSON === "function" ? user.toJSON() : { ...user };
  delete u.password;
  delete u.token;
  return u;
}

module.exports = {
  ACCESS_TTL,
  REFRESH_DAYS,
  buildAccessPayload,
  signAccess,
  issueRefresh,
  rotateRefresh,
  revokeToken,
  revokeAllUser,
  cleanupTokens,
  userAman,
};

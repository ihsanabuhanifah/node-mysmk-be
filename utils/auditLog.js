// Utilitas audit log: sanitasi body + simpan baris log tanpa pernah melempar error.
const models = require("../models");
const { Op } = require("sequelize");

const MAX_DATA = 5000; // ~5KB
const MAX_DEPTH = 6;
// Role yang tidak dicatat (bukan staf): 8 = Wali Siswa, 9 = Santri
const ROLE_NON_STAF = [8, 9];

const kunciSensitif = (key) => {
  const k = String(key).toLowerCase();
  return k.includes("password") || k.includes("token") || k === "secretkey" || k === "otp";
};

function bersihkan(val, depth = 0) {
  if (val === null || val === undefined) return val;
  if (Buffer.isBuffer(val)) return "[file]";
  if (depth > MAX_DEPTH) return "[...]";
  if (Array.isArray(val)) return val.slice(0, 100).map((v) => bersihkan(v, depth + 1));
  if (typeof val === "object") {
    // objek file dari multer
    if (val.buffer && (val.originalname || val.mimetype)) {
      return { file: val.originalname, mimetype: val.mimetype, size: val.size };
    }
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (kunciSensitif(k)) continue;
      out[k] = bersihkan(v, depth + 1);
    }
    return out;
  }
  if (typeof val === "string" && val.length > 1000) return val.slice(0, 1000) + "…";
  return val;
}

/** Body request -> string JSON yang aman disimpan (tanpa password/token, maks ~5KB). */
function sanitizeData(body) {
  try {
    if (body === undefined || body === null) return null;
    if (typeof body === "object" && !Array.isArray(body) && Object.keys(body).length === 0) return null;
    let s = JSON.stringify(bersihkan(body));
    if (s && s.length > MAX_DATA) s = s.slice(0, MAX_DATA) + "…[dipotong]";
    return s || null;
  } catch (e) {
    return null;
  }
}

function ambilIp(req) {
  const xff = req.headers?.["x-forwarded-for"];
  const ip = (xff ? String(xff).split(",")[0] : null) || req.ip || req.socket?.remoteAddress || null;
  return ip ? String(ip).trim().slice(0, 64) : null;
}

const potong = (v, n) => (v === undefined || v === null ? null : String(v).slice(0, n));

/** Simpan satu baris audit log. Tidak pernah melempar error & tidak perlu di-await. */
function catatAudit(row) {
  try {
    models.audit_log
      .create({
        user_id: row.user_id ?? null,
        user_name: potong(row.user_name, 150),
        user_email: potong(row.user_email, 150),
        role: potong(row.role, 50),
        action: potong(row.action, 20),
        method: potong(row.method, 10),
        path: potong(row.path, 255),
        target_id: potong(row.target_id, 64),
        status_code: row.status_code ?? null,
        ip: potong(row.ip, 64),
        user_agent: potong(row.user_agent, 255),
        data: row.data ?? null,
      })
      .catch((e) => console.log("audit log gagal", e?.message));
  } catch (e) {
    console.log("audit log gagal", e?.message);
  }
}

/** Data dasar dari request (ip, user agent). */
const infoRequest = (req) => ({
  ip: ambilIp(req),
  user_agent: req.headers?.["user-agent"],
});

const isStaf = (roleId) => !ROLE_NON_STAF.includes(Number(roleId));

/** Hapus log lebih lama dari AUDIT_LOG_DAYS hari (default 365). */
function cleanupAuditLog() {
  const hari = Number(process.env.AUDIT_LOG_DAYS) || 365;
  const batas = new Date(Date.now() - hari * 24 * 3600 * 1000);
  return models.audit_log.destroy({ where: { createdAt: { [Op.lt]: batas } } });
}

module.exports = { sanitizeData, catatAudit, infoRequest, ambilIp, isStaf, cleanupAuditLog };

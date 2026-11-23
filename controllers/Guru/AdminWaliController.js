// Manajemen Wali Santri oleh Admin:
// daftar wali, tambah akun wali, hubungkan / putuskan wali <-> santri, reset password.
//
// Model data: 1 akun wali (users + user_roles role 8) punya 1 baris `parents`.
// parents.student_id = santri yang terhubung (NULL = belum dihubungkan -> wali belum bisa login).
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const models = require("../../models");
const { revokeAllUser } = require("../../utils/tokenService");

const ROLE_WALI = 8;
const HUBUNGAN = ["ayah", "ibu", "wali"];

/** Password awal yang mudah dibaca (tanpa karakter mirip seperti 0/O, 1/l). */
function buatPassword(panjang = 10) {
  const huruf = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(panjang);
  return Array.from(bytes, (b) => huruf[b % huruf.length]).join("");
}

/** Kelas aktif per student_id: { [id]: "XII RPL" } */
async function kelasAktif(studentIds) {
  const ids = [...new Set(studentIds.filter(Boolean))];
  if (!ids.length) return {};
  const rows = await models.kelas_student.findAll({
    where: { student_id: ids, status: 1 },
    attributes: ["student_id"],
    include: [{ model: models.kelas, as: "kelas", attributes: ["nama_kelas"] }],
  });
  return Object.fromEntries(rows.map((r) => [r.student_id, r.kelas?.nama_kelas || null]));
}

const bentukWali = (p, kelas) => ({
  id: p.id,
  user_id: p.user_id,
  nama_wali: p.nama_wali || p.wali?.name,
  email: p.wali?.email,
  no_hp: p.no_hp || p.wali?.no_hp,
  hubungan: p.hubungan,
  status_akun: p.wali?.status || "active",
  // data yang diisi wali saat mendaftar (dipakai untuk mencocokkan santri)
  klaim_nisn: p.nisn,
  klaim_nama_siswa: p.nama_siswa,
  siswa: p.siswa
    ? { id: p.siswa.id, nama_siswa: p.siswa.nama_siswa, nisn: p.siswa.nisn, kelas: kelas[p.siswa.id] || null }
    : null,
  createdAt: p.createdAt,
});

// GET /guru/admin-wali/list?status=menunggu|terhubung&keyword=&page=&pageSize=
async function listWali(req, res) {
  try {
    const { status, keyword } = req.query;
    const limit = Math.min(parseInt(req.query.pageSize, 10) || 10, 100);
    const offset = parseInt(req.query.page, 10) || 0; // sudah berupa offset (paginationMiddleware)

    const where = {};
    if (status === "menunggu") where.student_id = null;
    if (status === "terhubung") where.student_id = { [Op.ne]: null };
    if (keyword) {
      const like = { [Op.like]: `%${keyword}%` };
      where[Op.or] = [
        { nama_wali: like },
        { nisn: like },
        { nama_siswa: like },
        { "$wali.email$": like },
        { "$wali.name$": like },
        { "$siswa.nama_siswa$": like },
        { "$siswa.nisn$": like },
      ];
    }

    const { count, rows } = await models.parent.findAndCountAll({
      where,
      include: [
        // hanya akun yang benar-benar ber-role Wali Siswa
        {
          model: models.user,
          as: "wali",
          required: true,
          attributes: ["id", "name", "email", "no_hp", "status"],
          include: [{ model: models.user_role, as: "userRole", required: true, attributes: [], where: { role_id: ROLE_WALI } }],
        },
        { model: models.student, as: "siswa", required: false, attributes: ["id", "nama_siswa", "nisn"] },
      ],
      order: [
        // yang menunggu dihubungkan tampil paling atas
        [models.sequelize.literal("`parent`.`student_id` IS NULL"), "DESC"],
        ["id", "DESC"],
      ],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    const [kelas, jumlahMenunggu] = await Promise.all([
      kelasAktif(rows.map((r) => r.student_id)),
      models.parent.count({
        where: { student_id: null },
        include: [
          {
            model: models.user,
            as: "wali",
            required: true,
            attributes: [],
            include: [{ model: models.user_role, as: "userRole", required: true, attributes: [], where: { role_id: ROLE_WALI } }],
          },
        ],
      }),
    ]);

    return res.json({
      status: "Success",
      msg: "Daftar wali santri",
      data: { count, rows: rows.map((r) => bentukWali(r, kelas)) },
      jumlahMenunggu,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

// GET /guru/admin-wali/cari-santri?keyword=  (nama / NISN / NIS, maks 20)
async function cariSantri(req, res) {
  try {
    const keyword = String(req.query.keyword || "").trim();
    if (keyword.length < 2) return res.json({ status: "Success", data: [] });
    const like = { [Op.like]: `%${keyword}%` };

    const rows = await models.student.findAll({
      where: { [Op.or]: [{ nama_siswa: like }, { nisn: like }, { nis: like }] },
      attributes: ["id", "nama_siswa", "nisn", "nis", "angkatan"],
      include: [{ model: models.parent, as: "parent", required: false, attributes: ["id", "nama_wali", "hubungan"] }],
      order: [["nama_siswa", "ASC"]],
      limit: 20,
    });
    const kelas = await kelasAktif(rows.map((r) => r.id));

    return res.json({
      status: "Success",
      data: rows.map((s) => ({
        id: s.id,
        nama_siswa: s.nama_siswa,
        nisn: s.nisn,
        nis: s.nis,
        angkatan: s.angkatan,
        kelas: kelas[s.id] || null,
        // wali lain yang sudah terhubung (mis. ayah sudah, ibu belum)
        wali: (Array.isArray(s.parent) ? s.parent : s.parent ? [s.parent] : []).map((p) => ({
          id: p.id,
          nama_wali: p.nama_wali,
          hubungan: p.hubungan,
        })),
      })),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

async function cariParent(id) {
  return models.parent.findByPk(id, {
    include: [{ model: models.user, as: "wali", attributes: ["id", "name", "email"] }],
  });
}

// POST /guru/admin-wali/create  { nama_wali, email, no_hp, hubungan, student_id? }
async function tambahWali(req, res) {
  const nama = String(req.body?.nama_wali || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const noHp = String(req.body?.no_hp || "").trim();
  const hubungan = String(req.body?.hubungan || "").toLowerCase();
  const studentId = req.body?.student_id ? Number(req.body.student_id) : null;

  if (!nama || !/^\S+@\S+\.\S+$/.test(email) || !HUBUNGAN.includes(hubungan)) {
    return res.status(422).json({ status: "Fail", msg: "Nama, email yang valid, dan hubungan (ayah/ibu/wali) wajib diisi" });
  }

  const t = await models.sequelize.transaction();
  try {
    const ada = await models.user.findOne({ where: { email }, attributes: ["id"], transaction: t });
    if (ada) {
      await t.rollback();
      return res.status(422).json({ status: "Fail", msg: "Email sudah dipakai akun lain" });
    }

    let siswa = null;
    if (studentId) {
      siswa = await models.student.findByPk(studentId, { attributes: ["id", "nama_siswa", "nisn"], transaction: t });
      if (!siswa) {
        await t.rollback();
        return res.status(422).json({ status: "Fail", msg: "Santri tidak ditemukan" });
      }
    }

    const password = buatPassword();
    const user = await models.user.create(
      {
        name: nama,
        email,
        password: bcrypt.hashSync(password, 10),
        no_hp: noHp || null,
        status: "active",
        email_verified: false,
      },
      { transaction: t }
    );
    await models.user_role.create({ user_id: user.id, role_id: ROLE_WALI, status: "active" }, { transaction: t });
    const parent = await models.parent.create(
      {
        user_id: user.id,
        nama_wali: nama,
        hubungan,
        no_hp: noHp || null,
        student_id: siswa?.id || null,
        nisn: siswa?.nisn || null,
        nama_siswa: siswa?.nama_siswa || null,
      },
      { transaction: t }
    );
    await t.commit();

    return res.status(201).json({
      status: "Success",
      msg: siswa
        ? `Akun wali dibuat dan terhubung ke ${siswa.nama_siswa}`
        : "Akun wali dibuat. Hubungkan ke santri agar wali bisa login.",
      data: { id: parent.id, email, nama_wali: nama },
      // hanya ditampilkan sekali ke admin; tidak disimpan dalam bentuk asli
      password,
    });
  } catch (err) {
    await t.rollback().catch(() => {});
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

// PUT /guru/admin-wali/:id/hubungkan  { student_id }
async function hubungkan(req, res) {
  try {
    const parent = await cariParent(req.params.id);
    if (!parent) return res.status(404).json({ status: "Fail", msg: "Wali tidak ditemukan" });

    const siswa = await models.student.findByPk(Number(req.body?.student_id), { attributes: ["id", "nama_siswa", "nisn"] });
    if (!siswa) return res.status(422).json({ status: "Fail", msg: "Santri tidak ditemukan" });

    const sebelumnya = parent.student_id;
    await parent.update({ student_id: siswa.id, nisn: siswa.nisn, nama_siswa: siswa.nama_siswa });
    // pindah santri -> sesi lama (yang berisi santri sebelumnya) dicabut
    if (sebelumnya && sebelumnya !== siswa.id) await revokeAllUser(parent.user_id, "mapping");

    return res.json({
      status: "Success",
      msg: `${parent.nama_wali || parent.wali?.name} terhubung ke ${siswa.nama_siswa}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

// PUT /guru/admin-wali/:id/putuskan
async function putuskan(req, res) {
  try {
    const parent = await cariParent(req.params.id);
    if (!parent) return res.status(404).json({ status: "Fail", msg: "Wali tidak ditemukan" });
    if (!parent.student_id) return res.json({ status: "Success", msg: "Wali memang belum terhubung" });

    await parent.update({ student_id: null });
    await revokeAllUser(parent.user_id, "mapping");
    return res.json({ status: "Success", msg: "Hubungan wali dan santri diputuskan. Wali tidak bisa login sampai dihubungkan lagi." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

// PUT /guru/admin-wali/:id/reset-password  -> password baru (ditampilkan sekali)
async function resetPassword(req, res) {
  try {
    const parent = await cariParent(req.params.id);
    if (!parent?.wali) return res.status(404).json({ status: "Fail", msg: "Wali tidak ditemukan" });

    const password = buatPassword();
    await models.user.update({ password: bcrypt.hashSync(password, 10) }, { where: { id: parent.user_id } });
    await revokeAllUser(parent.user_id, "password");
    return res.json({ status: "Success", msg: "Password berhasil direset", email: parent.wali.email, password });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

// PUT /guru/admin-wali/:id  { nama_wali, no_hp, hubungan }
async function ubahWali(req, res) {
  try {
    const parent = await cariParent(req.params.id);
    if (!parent) return res.status(404).json({ status: "Fail", msg: "Wali tidak ditemukan" });

    const nama = req.body?.nama_wali !== undefined ? String(req.body.nama_wali).trim() : undefined;
    const noHp = req.body?.no_hp !== undefined ? String(req.body.no_hp).trim() : undefined;
    const hubungan = req.body?.hubungan !== undefined ? String(req.body.hubungan).toLowerCase() : undefined;
    if (nama === "" || (hubungan !== undefined && !HUBUNGAN.includes(hubungan))) {
      return res.status(422).json({ status: "Fail", msg: "Nama wajib diisi dan hubungan harus ayah/ibu/wali" });
    }

    await parent.update({
      ...(nama !== undefined && { nama_wali: nama }),
      ...(noHp !== undefined && { no_hp: noHp || null }),
      ...(hubungan !== undefined && { hubungan }),
    });
    if (nama !== undefined || noHp !== undefined) {
      await models.user.update(
        { ...(nama !== undefined && { name: nama }), ...(noHp !== undefined && { no_hp: noHp || null }) },
        { where: { id: parent.user_id } }
      );
    }
    return res.json({ status: "Success", msg: "Data wali diperbarui" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}


// ---------------------------------------------------------------------------
// IMPORT MASSAL dari Excel (file dibaca di browser, dikirim sebagai JSON).
// NISN opsional: bila cocok -> langsung terhubung; bila kosong / tidak cocok -> akun tetap dibuat
// dengan status "Menunggu" dan dihubungkan belakangan lewat UI (tombol Hubungkan).
// POST /guru/admin-wali/import  { rows: [{ nama_wali, email, no_hp, hubungan, nisn }], simpan: boolean }
//   simpan=false -> hanya validasi (pratinjau); simpan=true -> buat akun utk baris valid.
// ---------------------------------------------------------------------------
const MAKS_BARIS_IMPORT = 500;

/** NISN dari Excel bisa kehilangan angka 0 di depan (dibaca sebagai angka) -> coba juga versi 10 digit. */
const kandidatNisn = (nisn) => {
  const v = String(nisn ?? "").trim().replace(/\.0+$/, "");
  if (!v) return [];
  return [...new Set([v, /^\d+$/.test(v) && v.length < 10 ? v.padStart(10, "0") : v])];
};

async function validasiBaris(rows) {
  const bersih = rows.map((r, i) => ({
    baris: Number(r?.baris) || i + 2, // nomor baris di Excel (header = baris 1)
    nama_wali: String(r?.nama_wali ?? "").trim(),
    email: String(r?.email ?? "").trim().toLowerCase(),
    // nomor HP yang diketik sebagai angka di Excel kehilangan 0 di depan: 812xxx -> 0812xxx
    no_hp: String(r?.no_hp ?? "").trim().replace(/[\s-]/g, "").replace(/^8(\d{7,12})$/, "08$1"),
    hubungan: String(r?.hubungan ?? "").trim().toLowerCase(),
    nisn: String(r?.nisn ?? "").trim(),
  }));

  // ambil data pembanding sekaligus (hemat query)
  const emails = [...new Set(bersih.map((r) => r.email).filter(Boolean))];
  const nisns = [...new Set(bersih.flatMap((r) => kandidatNisn(r.nisn)))];
  const [userAda, santri] = await Promise.all([
    emails.length ? models.user.findAll({ where: { email: emails }, attributes: ["email"] }) : [],
    nisns.length ? models.student.findAll({ where: { nisn: nisns }, attributes: ["id", "nama_siswa", "nisn"] }) : [],
  ]);
  const emailTerpakai = new Set(userAda.map((u) => String(u.email).toLowerCase()));
  const santriPerNisn = santri.reduce((m, s) => {
    (m[s.nisn] = m[s.nisn] || []).push(s);
    return m;
  }, {});
  const kelas = await kelasAktif(santri.map((s) => s.id));

  const hitungEmail = bersih.reduce((m, r) => ((m[r.email] = (m[r.email] || 0) + 1), m), {});

  return bersih.map((r) => {
    const error = [];
    const peringatan = [];
    if (!r.nama_wali) error.push("Nama wali kosong");
    if (!/^\S+@\S+\.\S+$/.test(r.email)) error.push("Email tidak valid");
    else if (emailTerpakai.has(r.email)) error.push("Email sudah dipakai akun lain");
    else if (hitungEmail[r.email] > 1) error.push("Email ganda di file");
    if (!HUBUNGAN.includes(r.hubungan)) error.push("Hubungan harus ayah/ibu/wali");

    let siswa = null;
    if (!r.nisn) peringatan.push("NISN kosong, hubungkan ke santri nanti");
    else {
      const cocok = kandidatNisn(r.nisn).flatMap((n) => santriPerNisn[n] || []);
      const unik = [...new Map(cocok.map((s) => [s.id, s])).values()];
      if (unik.length === 0) peringatan.push("NISN tidak ditemukan, hubungkan ke santri nanti");
      else if (unik.length > 1) peringatan.push("NISN cocok dengan lebih dari satu santri, pilih manual nanti");
      else siswa = { id: unik[0].id, nama_siswa: unik[0].nama_siswa, nisn: unik[0].nisn, kelas: kelas[unik[0].id] || null };
    }
    return { ...r, siswa, valid: error.length === 0, error, peringatan };
  });
}

async function importWali(req, res) {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (rows.length === 0) return res.status(422).json({ status: "Fail", msg: "File tidak berisi data" });
    if (rows.length > MAKS_BARIS_IMPORT) {
      return res.status(422).json({ status: "Fail", msg: `Maksimal ${MAKS_BARIS_IMPORT} baris per impor` });
    }

    const hasil = await validasiBaris(rows);
    const ringkas = {
      total: hasil.length,
      valid: hasil.filter((r) => r.valid).length,
      terhubung: hasil.filter((r) => r.valid && r.siswa).length,
    };
    ringkas.gagal = ringkas.total - ringkas.valid;
    ringkas.menunggu = ringkas.valid - ringkas.terhubung;

    if (!req.body?.simpan) {
      return res.json({ status: "Success", msg: "Pratinjau impor", ringkasan: ringkas, data: hasil });
    }

    // simpan: tiap baris dalam transaksi sendiri, agar 1 baris gagal tidak membatalkan yang lain
    let dibuat = 0;
    let dibuatTerhubung = 0;
    for (const r of hasil) {
      if (!r.valid) continue;
      const t = await models.sequelize.transaction();
      try {
        const password = buatPassword();
        const user = await models.user.create(
          { name: r.nama_wali, email: r.email, password: bcrypt.hashSync(password, 10), no_hp: r.no_hp || null, status: "active", email_verified: false },
          { transaction: t }
        );
        await models.user_role.create({ user_id: user.id, role_id: ROLE_WALI, status: "active" }, { transaction: t });
        await models.parent.create(
          {
            user_id: user.id,
            nama_wali: r.nama_wali,
            hubungan: r.hubungan,
            no_hp: r.no_hp || null,
            // tanpa santri -> NULL (status "Menunggu"); NISN dari file disimpan utk dicocokkan nanti
            student_id: r.siswa?.id || null,
            nisn: r.siswa?.nisn || r.nisn || null,
            nama_siswa: r.siswa?.nama_siswa || null,
          },
          { transaction: t }
        );
        await t.commit();
        r.dibuat = true;
        r.password = password; // hanya dikirim sekali ke admin
        dibuat += 1;
        if (r.siswa) dibuatTerhubung += 1;
      } catch (err) {
        await t.rollback().catch(() => {});
        console.log("import wali baris", r.baris, err.message);
        r.valid = false;
        r.error = ["Gagal disimpan (mungkin email baru saja dipakai)"];
      }
    }

    return res.json({
      status: "Success",
      msg: `${dibuat} akun wali dibuat (${dibuatTerhubung} terhubung, ${dibuat - dibuatTerhubung} menunggu dihubungkan)${ringkas.total - dibuat ? `, ${ringkas.total - dibuat} baris dilewati` : ""}`,
      ringkasan: { total: ringkas.total, dibuat, terhubung: dibuatTerhubung, menunggu: dibuat - dibuatTerhubung, gagal: ringkas.total - dibuat },
      data: hasil,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { listWali, cariSantri, tambahWali, hubungkan, putuskan, resetPassword, ubahWali, importWali };

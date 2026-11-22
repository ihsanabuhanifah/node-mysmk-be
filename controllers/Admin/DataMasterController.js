// Data Master: Tahun Ajaran, Kelas, Mata Pelajaran, Role (CRUD dengan pengaman)
const models = require("../../models");
const { sequelize } = require("../../models");
const { QueryTypes, Op } = require("sequelize");

const q = (sql, replacements = {}) =>
  sequelize.query(sql, { type: QueryTypes.SELECT, replacements });

// Role bawaan dipakai langsung oleh kode (nama & id) -> dikunci
const ROLE_SISTEM_MAX_ID = 12;
const isAlumni = (nama) => /alumni/i.test(String(nama || ""));

const MASTER = {
  ta: {
    label: "Tahun Ajaran",
    model: () => models.ta,
    refCol: "ta_id",
    searchField: "nama_tahun_ajaran",
    order: [["nama_tahun_ajaran", "DESC"]],
    fields: ["nama_tahun_ajaran"],
    async validate(data, existing) {
      const nama = String(data.nama_tahun_ajaran || "").trim();
      const m = nama.match(/^(\d{4})\/(\d{4})$/);
      if (!m) return "Format tahun ajaran harus YYYY/YYYY, mis. 2026/2027";
      if (Number(m[2]) !== Number(m[1]) + 1) return "Tahun kedua harus satu tahun setelah tahun pertama";
      const dup = await models.ta.findOne({
        where: { nama_tahun_ajaran: nama, ...(existing && { id: { [Op.ne]: existing.id } }) },
      });
      if (dup) return `Tahun ajaran ${nama} sudah ada`;
      return { nama_tahun_ajaran: nama };
    },
  },
  kelas: {
    label: "Kelas",
    model: () => models.kelas,
    refCol: "kelas_id",
    searchField: "nama_kelas",
    order: [["nama_kelas", "ASC"]],
    fields: ["nama_kelas"],
    async validate(data, existing) {
      const nama = String(data.nama_kelas || "").trim().replace(/\s+/g, " ");
      if (!nama) return "Nama kelas wajib diisi";
      if (existing && isAlumni(existing.nama_kelas) && !isAlumni(nama)) {
        return 'Nama kelas Alumni harus tetap mengandung kata "Alumni"';
      }
      const dup = await models.kelas.findOne({
        where: { nama_kelas: nama, ...(existing && { id: { [Op.ne]: existing.id } }) },
      });
      if (dup) return `Kelas ${nama} sudah ada`;
      // kolom tahun_ajaran pada tabel kelas selalu "1" di data yang ada
      return existing ? { nama_kelas: nama } : { nama_kelas: nama, tahun_ajaran: "1" };
    },
  },
  mapel: {
    label: "Mata Pelajaran",
    model: () => models.mapel,
    refCol: "mapel_id",
    searchField: "nama_mapel",
    order: [
      ["kategori", "ASC"],
      ["nama_mapel", "ASC"],
    ],
    fields: ["nama_mapel", "kategori"],
    async validate(data, existing) {
      const nama = String(data.nama_mapel || "").trim().replace(/\s+/g, " ");
      if (!nama) return "Nama mata pelajaran wajib diisi";
      const kategori = Number(data.kategori);
      if (!Number.isInteger(kategori) || kategori < 0 || kategori > 12) {
        return "Semester harus angka 0–12 (0 = umum)";
      }
      const dup = await models.mapel.findOne({
        where: { nama_mapel: nama, ...(existing && { id: { [Op.ne]: existing.id } }) },
      });
      if (dup) return `Mata pelajaran ${nama} sudah ada`;
      return { nama_mapel: nama, kategori: String(kategori) };
    },
  },
  role: {
    label: "Role",
    model: () => models.role,
    refCol: "role_id",
    searchField: "role_name",
    order: [["id", "ASC"]],
    fields: ["role_name", "remarks"],
    terkunci: (row) => Number(row.id) <= ROLE_SISTEM_MAX_ID,
    async validate(data, existing) {
      if (existing && Number(existing.id) <= ROLE_SISTEM_MAX_ID) {
        return "Role bawaan sistem tidak dapat diubah";
      }
      const nama = String(data.role_name || "").trim().replace(/\s+/g, " ");
      if (!nama) return "Nama role wajib diisi";
      const remarks = String(data.remarks || "guru");
      if (!["admin", "guru", "staf", "siswa"].includes(remarks)) return "Kelompok role tidak valid";
      const dup = await models.role.findOne({
        where: { role_name: nama, ...(existing && { id: { [Op.ne]: existing.id } }) },
      });
      if (dup) return `Role ${nama} sudah ada`;
      return { role_name: nama, remarks };
    },
  },
};

// Daftar tabel yang mereferensikan kolom (diambil dari skema DB, di-cache)
const refCache = {};
async function tabelReferensi(refCol) {
  if (!refCache[refCol]) {
    const rows = await q(
      `SELECT TABLE_NAME AS t FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = :c`,
      { c: refCol }
    );
    refCache[refCol] = rows.map((r) => r.t).filter((t) => /^[a-z0-9_]+$/i.test(t));
  }
  return refCache[refCol];
}

// { [id]: { total, detail: { tabel: jumlah } } }
// Semua tabel dihitung dalam SATU query (UNION ALL) agar cukup satu round-trip ke DB.
// Tiap bagian memakai index kolom referensi (WHERE col IN (...) GROUP BY col).
async function hitungPemakaian(refCol, ids) {
  const hasil = {};
  if (!ids.length) return hasil;
  const tabel = await tabelReferensi(refCol);
  if (!tabel.length) return hasil;

  const sql = tabel
    .map(
      (t) =>
        `SELECT '${t}' AS t, \`${refCol}\` AS id, COUNT(*) AS n FROM \`${t}\`
          WHERE \`${refCol}\` IN (:ids) GROUP BY \`${refCol}\``
    )
    .join(" UNION ALL ");

  const rows = await q(sql, { ids });
  rows.forEach((r) => {
    const h = (hasil[r.id] = hasil[r.id] || { total: 0, detail: {} });
    h.total += Number(r.n);
    h.detail[r.t] = Number(r.n);
  });
  return hasil;
}

function ambilConfig(req, res) {
  const cfg = MASTER[req.params.jenis];
  if (!cfg) {
    res.status(404).json({ status: "fail", msg: "Jenis data master tidak dikenal" });
    return null;
  }
  return cfg;
}

// GET /guru/master/:jenis?keyword=&page=&pageSize=
async function list(req, res) {
  const cfg = ambilConfig(req, res);
  if (!cfg) return;
  try {
    const Model = cfg.model();
    const kw = String(req.query.keyword || "").trim();
    const where = kw ? { [cfg.searchField]: { [Op.substring]: kw } } : {};
    const pageSize = Number(req.query.pageSize) || null;
    const offset = Number(req.query.page) || 0; // sudah offset (paginationMiddleware)

    const { count, rows } = await Model.findAndCountAll({
      where,
      order: cfg.order,
      attributes: ["id", ...cfg.fields],
      raw: true,
      ...(pageSize && { limit: pageSize, offset }),
    });
    // Pemakaian TIDAK dihitung di daftar (agar ringan); dicek hanya saat hapus.

    return res.json({
      status: "Success",
      data: {
        count,
        rows: rows.map((r) => ({
          ...r,
          terkunci: cfg.terkunci ? cfg.terkunci(r) : false,
          alumni: req.params.jenis === "kelas" ? isAlumni(r.nama_kelas) : undefined,
        })),
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// POST /guru/master/:jenis
async function create(req, res) {
  const cfg = ambilConfig(req, res);
  if (!cfg) return;
  try {
    const data = await cfg.validate(req.body || {}, null);
    if (typeof data === "string") return res.status(422).json({ status: "fail", msg: data });
    const row = await cfg.model().create(data);
    return res.json({ status: "Success", msg: `${cfg.label} berhasil ditambahkan`, data: row });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// PUT /guru/master/:jenis/:id
async function update(req, res) {
  const cfg = ambilConfig(req, res);
  if (!cfg) return;
  try {
    const row = await cfg.model().findByPk(req.params.id);
    if (!row) return res.status(404).json({ status: "fail", msg: `${cfg.label} tidak ditemukan` });
    const data = await cfg.validate(req.body || {}, row);
    if (typeof data === "string") return res.status(422).json({ status: "fail", msg: data });
    await row.update(data);
    return res.json({ status: "Success", msg: `${cfg.label} berhasil diperbarui` });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// DELETE /guru/master/:jenis/:id  (hanya jika belum dipakai)
async function destroy(req, res) {
  const cfg = ambilConfig(req, res);
  if (!cfg) return;
  try {
    const row = await cfg.model().findByPk(req.params.id, { raw: true });
    if (!row) return res.status(404).json({ status: "fail", msg: `${cfg.label} tidak ditemukan` });
    if (cfg.terkunci && cfg.terkunci(row)) {
      return res.status(422).json({ status: "fail", msg: "Data bawaan sistem tidak dapat dihapus" });
    }
    if (req.params.jenis === "kelas" && isAlumni(row.nama_kelas)) {
      return res.status(422).json({ status: "fail", msg: "Kelas Alumni tidak dapat dihapus" });
    }
    const pakai = (await hitungPemakaian(cfg.refCol, [row.id]))[row.id];
    if (pakai?.total) {
      return res.status(422).json({
        status: "fail",
        msg: `${cfg.label} sudah dipakai di ${pakai.total} data, tidak dapat dihapus`,
        dipakai_detail: pakai.detail,
      });
    }
    await cfg.model().destroy({ where: { id: row.id } });
    return res.json({ status: "Success", msg: `${cfg.label} berhasil dihapus` });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { list, create, update, destroy };

// Pelanggaran santri untuk Wali (dibatasi ke req.StudentId, filter lewat replacements).
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const { arahUrut, paginasi, infoHalaman } = require("../../utils/sqlWali");

async function listPelanggaran(req, res) {
  try {
    const { tahunAjaran, semester, dariTanggal, sampaiTanggal, kategori, tipe } = req.query;
    const orderBy = arahUrut(req.query.orderBy);
    const pg = paginasi(req.query.page, req.query.pageSize);

    const where = ["a.student_id = :studentId"];
    const rep = { studentId: req.StudentId, ...pg.replacements };
    if (tahunAjaran !== undefined) { where.push("f.nama_tahun_ajaran = :tahunAjaran"); rep.tahunAjaran = tahunAjaran; }
    if (semester !== undefined) { where.push("a.semester = :semester"); rep.semester = semester; }
    if (dariTanggal !== undefined && sampaiTanggal !== undefined) {
      where.push("a.tanggal BETWEEN :dariTanggal AND :sampaiTanggal");
      rep.dariTanggal = dariTanggal;
      rep.sampaiTanggal = sampaiTanggal;
    }
    if (kategori !== undefined) { where.push("c.kategori = :kategori"); rep.kategori = kategori; }
    if (tipe !== undefined) { where.push("c.tipe = :tipe"); rep.tipe = tipe; }

    const data = await sequelize.query(
      `SELECT
        a.id,
        a.tanggal,
        b.nama_siswa,
        c.nama_pelanggaran,
        c.tipe,
        c.kategori,
        c.point,
        c.hukuman,
        d.nama_guru AS dilaporkan_oleh,
        e.nama_guru AS ditindak_oleh,
        a.semester,
        f.nama_tahun_ajaran AS tahun_ajaran
      FROM pelanggaran_siswas AS a
      LEFT JOIN students AS b ON (a.student_id = b.id)
      LEFT JOIN pelanggarans AS c ON (a.pelanggaran_id = c.id)
      LEFT JOIN teachers AS d ON (a.pelapor = d.id)
      LEFT JOIN teachers AS e ON (a.penindak = e.id)
      LEFT JOIN ta AS f ON (a.ta_id = f.id)
      WHERE ${where.join(" AND ")}
      ORDER BY a.tanggal ${orderBy}
      ${pg.limit};`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    if (data.length === 0) {
      return res.json({
        status: "Fail",
        msg: "Tidak ditemukan pelanggaran pada periode yang dipilih",
      });
    }

    return res.json({
      status: "Success",
      msg: "Data Pelanggaran ditemukan",
      ...infoHalaman(pg, data.length),
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { listPelanggaran };

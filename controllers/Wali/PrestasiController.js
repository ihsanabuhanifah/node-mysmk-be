// Prestasi santri untuk Wali (dibatasi ke req.StudentId, filter lewat replacements).
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const { arahUrut, paginasi, infoHalaman } = require("../../utils/sqlWali");

async function listPrestasi(req, res) {
  try {
    const { tahunAjaran, semester, keyword, dariTanggal, sampaiTanggal } = req.query;
    const orderBy = arahUrut(req.query.orderBy);
    const pg = paginasi(req.query.page, req.query.pageSize);

    const where = ["a.student_id = :studentId"];
    const rep = { studentId: req.StudentId, ...pg.replacements };
    if (dariTanggal !== undefined && sampaiTanggal !== undefined) {
      where.push("a.tanggal BETWEEN :dariTanggal AND :sampaiTanggal");
      rep.dariTanggal = dariTanggal;
      rep.sampaiTanggal = sampaiTanggal;
    }
    if (semester !== undefined) { where.push("a.semester = :semester"); rep.semester = semester; }
    if (tahunAjaran !== undefined) { where.push("c.nama_tahun_ajaran = :tahunAjaran"); rep.tahunAjaran = tahunAjaran; }
    if (keyword !== undefined && keyword !== null && keyword !== "") {
      // dikurung agar OR tidak membuka data santri lain
      where.push("(a.prestasi LIKE :keyword OR a.kategori LIKE :keyword)");
      rep.keyword = `%${keyword}%`;
    }

    const data = await sequelize.query(
      `SELECT
        a.id,
        a.tanggal,
        b.nama_siswa,
        a.prestasi,
        a.kategori,
        a.semester,
        c.nama_tahun_ajaran AS tahun_ajaran
      FROM prestasis AS a
      LEFT JOIN students AS b ON (a.student_id = b.id)
      LEFT JOIN ta AS c ON (a.ta_id = c.id)
      WHERE ${where.join(" AND ")}
      ORDER BY a.tanggal ${orderBy}
      ${pg.limit};`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    if (data.length === 0) {
      return res.json({
        status: "Fail",
        msg: "Tidak ditemukan prestasi pada periode yang dipilih",
      });
    }

    return res.json({
      status: "Success",
      msg: "Data Prestasi ditemukan",
      ...infoHalaman(pg, data.length),
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { listPrestasi };

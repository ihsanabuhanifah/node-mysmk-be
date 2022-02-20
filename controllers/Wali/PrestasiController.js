const prestasi = require("../../models").prestasi;
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const { formatDate } = require("../../utils/format");

async function listPrestasi(req, res) {
  try {
    let {
      tahunAjaran,
      semester,
      keyword,
      dariTanggal,
      sampaiTanggal,
      page,
      pageSize,
      orderBy,
    } = req.query;

    if (tahunAjaran !== undefined) {
      tahunAjaran = `AND c.nama_tahun_ajaran = '${tahunAjaran}'`;
    } else {
      tahunAjaran = "";
    }
    if (keyword === undefined || keyword === null) {
        keyword = "";
    } else {
     
      keyword = `AND a.prestasi  LIKE '%${keyword}%' OR a.kategori LIKE '%${keyword}%'`;
    }

    if (semester !== undefined ) {
      semester = `AND a.semester = '${semester}'`;
    } else {
      semester = "";
    }

    if (dariTanggal !== undefined && sampaiTanggal !== undefined) {
      tanggal = `AND a.tanggal BETWEEN  '${dariTanggal}' AND '${sampaiTanggal}' `;
    } else {
      tanggal = "";
    }
    let limit = "";
    if (page !== undefined && pageSize !== undefined) {
      limit = `LIMIT ${page}, ${pageSize}`;
    }
    if (orderBy === undefined) {
      orderBy = "desc";
    }
    try {
      const absensi = await sequelize.query(
        `
        
       
        SELECT
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
    WHERE a.student_id = ${req.StudentId} ${tanggal} ${semester} ${tahunAjaran}
  ${keyword}
    ORDER BY  a.tanggal ${orderBy}
    ${limit}
          ;`,
        {
          type: QueryTypes.SELECT,
        }
      );

      if (absensi.length === 0) {
        return res.json({
          status: "Fail",
          msg: "Tidak ditemukan absensi halaqoh pada periode yang dipilih",
        });
      }

      return res.json({
        status: "Success",
        msg: "Data Pelanggaran ditemukan",
        page: page + 1,
        nextPage: page + 2,
        previousPage: page + 1 - 1,
        pageSize: pageSize,
        totalData: absensi.length,

        // page: page + 1,
        // nextPage: page + 2,
        // previousPage: page + 1 - 1,
        // pageSize: pageSize,
        // totalData: absensi.length,
        data: absensi,
      });
    } catch (err) {
      console.log(err);
      res.status(403).json({
        msg: "Terjadi Kesalahan",
      });
    }
  } catch (err) {
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { listPrestasi };

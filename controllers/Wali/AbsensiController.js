const AbsensiKelasModel = require("../../models").absensi_kelas;
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");
const { paramsQueryAND } = require("../../utils/paramsQuery");
dotenv.config();

async function list(req, res) {
  let {
    tahunAjaran,
    semester,
    statusKehadiran,
    tanggal,
    namaMapel,
    page,
    pageSize,
  } = req.query;

  if (tahunAjaran !== undefined) {
    tahunAjaran = `AND a.tahunAjaran = '${tahunAjaran}'`;
  } else {
    tahunAjaran = "";
  }
  // paramsQueryAND(tahunAjaran, 'tahunAjaran')
  if (semester !== undefined) {
    semester = `AND a.semester = '${semester}'`;
  } else {
    semester = "";
  }
  if (statusKehadiran !== undefined) {
    statusKehadiran = `AND a.statusKehadiran = '${statusKehadiran}'`;
  } else {
    statusKehadiran = "";
  }
  if (namaMapel !== undefined) {
    namaMapel = `AND a.mapelId = '${namaMapel}'`;
  } else {
    namaMapel = "";
  }
  if (tanggal !== undefined) {
    tanggal = `AND a.tanggal = '${tanggal}'`;
  } else {
    tanggal = "";
  }
  let limit = '';
  if (page !== undefined && pageSize !== undefined) {
   
    limit = `LIMIT ${page}, ${pageSize}`;
  }

  try {
    const absensi = await sequelize.query(
      `SELECT a.id ,a.tanggal ,a.mapelId, e.namaGuru, a.pelajaranKe, b.namaSiswa , c.namaKelas , d.namaMapel , a.materi,
        a.statusKehadiran,a.keterangan, a.semester , a.tahunAjaran,a.createdAt,a.updatedAt FROM 
        absensi_kelas AS a JOIN students AS b ON (a.studentId =b.id) 
        JOIN kelas AS c ON (a.kelasId = c.id ) 
       
        JOIN mapels AS d ON (a.mapelId = d.id) 
        JOIN teachers As e ON (a.teacherId = e.id)
        WHERE a.studentId = ${req.StudentId}
        ${namaMapel}
       ${tahunAjaran}
       ${semester}
        ${tanggal}
        ${statusKehadiran}

        ${limit}
        ORDER BY a.tanggal desc , a.pelajaranKe asc
        ;`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (absensi.length === 0) {
      return res.json({
        status: "Success",

        absensi: "Data tidak ditemukan",
      });
    }
    return res.json({
      status: "Success",
      page: page + 1,
      nextPage: page + 2,
      previousPage: page - 2,
      pageSize: pageSize,
      totalData : absensi.length,
      absensi: absensi,
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { list };



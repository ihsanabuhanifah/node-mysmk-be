const AbsensiKelasModel = require("../../models").AbsensiKelas;
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

async function list(req, res) {
  const tahunAjaran = req.query.tahunAjaran;
  const params = (a) => {
      const keyword = ''
    if (tahunAjaran !== undefined) {
      return (a = `${tahunAjaran}`);
    }
  };
  try {
    const absensi = await sequelize.query(
      `SELECT a.id ,a.tanggal , b.namaSiswa , c.namaKelas , d.namaMapel , a.materi,
        a.alasan,a.keterangan, a.semester , a.tahunAjaran,a.createdAt,a.updatedAt FROM 
        AbsensiKelas AS a JOIN Students AS b ON (a.StudentId =b.id) 
        JOIN Kelas AS c ON (a.KelasId = c.id ) 
        JOIN Mapels as d ON (a.MapelId = d.id) WHERE a.StudentId = ${
          req.idSiswa
        } AND ${params(`a.tahunAjaran`)}  ;`,
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

// const AbsensiKelasModel = require("../../models").AbsensiKelas;
// const { sequelize } = require("../../models");
// const { QueryTypes } = require("sequelize");
// const dotenv = require("dotenv");
// dotenv.config();

// async function list(req, res) {

//   try {
//     const absensi = await sequelize.query(
//       `SELECT a.id ,a.tanggal , b.namaSiswa , c.namaKelas , d.namaMapel , a.materi, a.alasan,a.keterangan,a.createdAt,a.updatedAt FROM
//         AbsensiKelas AS a JOIN Students AS b ON (a.StudentId =b.id)
//         JOIN Kelas AS c ON (a.KelasId = c.id )
//         JOIN Mapels as d ON (a.MapelId = d.id) WHERE a.StudentId = ${req.idSiswa} ;`,
//       {
//         type: QueryTypes.SELECT,
//       }
//     );
//     return res.json({
//       status: "Success",
//       absensi: absensi,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(403).json({
//       msg: "Terjadi Kesalahan",
//     });
//   }
// }

// module.exports = { list };

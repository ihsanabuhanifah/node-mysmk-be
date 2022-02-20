const PelanggaranModel = require("../../models").pelanggaran_siswa;
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const { formatDate } = require("../../utils/format");

async function listPelanggaran(req, res) {
  try {
    let {
      tahunAjaran,
      semester,
      statusKehadiran,
      dariTanggal,
      sampaiTanggal,
      kategori,
      tipe,
      page,
      pageSize,
      orderBy,
    } = req.query;

    if (tahunAjaran !== undefined) {
      tahunAjaran = `AND f.nama_tahun_ajaran = '${tahunAjaran}'`;
    } else {
      tahunAjaran = "";
    }
  
    if (semester !== undefined) {
      semester = `AND a.semester = '${semester}'`;
    } else {
      semester = "";
    }
    if (statusKehadiran !== undefined) {
      statusKehadiran = `AND g.nama_status_kehadiran = '${statusKehadiran}'`;
    } else {
      statusKehadiran = "";
    }
    if (kategori !== undefined) {
      kategori = `AND c.kategori = '${kategori}'`;
    } else {
      kategori = "";
    }
    if (tipe !== undefined) {
      tipe = `AND c.tipe = '${tipe}'`;
    } else {
      tipe = "";
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
          c.nama_pelanggaran,
          c.tipe,
          c.kategori,
          c.point,
          c.hukuman,
          d.nama_guru AS dilaporkan_oleh,
          e.nama_guru AS ditindak_oleh,
          a.semester,
          f.nama_tahun_ajaran AS tahun_ajaran
        FROM
          pelanggaran_siswas AS a
          LEFT JOIN students AS b ON (a.student_id = b.id)
          LEFT JOIN pelanggarans AS c ON (a.pelanggaran_id = c.id)
          LEFT JOIN teachers AS d on (a.pelapor = d.id)
          LEFT JOIN teachers AS e on (a.penindak = e.id)
          LEFT JOIN ta AS f ON (a.ta_id = f.id)
          
        WHERE a.student_id = ${req.StudentId} ${tahunAjaran} ${semester} ${tanggal} ${kategori} ${tipe}
        
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

module.exports = { listPelanggaran };

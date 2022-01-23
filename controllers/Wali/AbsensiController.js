const AbsensiKelasModel = require("../../models").absensi_kelas;
const AbsensiHalaqohModel = require("../../models").absensi_halaqoh;
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
    dariTanggal,
    sampaiTanggal,
    namaMapel,
    page,
    pageSize,
  } = req.query;

  if (tahunAjaran !== undefined) {
    tahunAjaran = `AND a.tahun_ajaran = '${tahunAjaran}'`;
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
    statusKehadiran = `AND a.status_kehadiran = '${statusKehadiran}'`;
  } else {
    statusKehadiran = "";
  }
  if (namaMapel !== undefined) {
    namaMapel = `AND a.mapel_id = '${namaMapel}'`;
  } else {
    namaMapel = "";
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

  try {
    const absensi = await sequelize.query(
      `SELECT a.id ,a.tanggal ,a.mapel_id, e.nama_guru, a.pelajaran_ke, b.nama_siswa , c.nama_kelas , d.nama_mapel , a.materi,
        a.status_kehadiran,a.keterangan, a.semester , a.tahun_ajaran,a.created_at,a.updated_at FROM 
        absensi_kelas AS a JOIN students AS b ON (a.student_id =b.id) 
        JOIN kelas AS c ON (a.kelas_id = c.id ) 
       
        JOIN mapels AS d ON (a.mapel_id = d.id) 
        JOIN teachers As e ON (a.teacher_id = e.id)
        WHERE a.student_id = ${req.StudentId}
        ${namaMapel}
       ${tahunAjaran}
       ${semester}
        ${tanggal}
        ${statusKehadiran}

        ${limit}
        ORDER BY a.tanggal desc , a.pelajaran_ke asc
        ;`,
      {
        type: QueryTypes.SELECT,
      }
    );

    if (absensi.length === 0) {
      return res.json({
        status: "Success",
        msg: "Data  Absensi Kelas tidak ditemukan",
        data: [],
      });
    }
    return res.json({
      status: "Success",
      msg: "Data  Absensi Kelas ditemukan",
      page: page + 1,
      nextPage: page + 2,
      previousPage: page - 2,
      pageSize: pageSize,
      totalData: absensi.length,
      data: absensi,
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({
      msg: "Terjadi Kesalahan",
    });
  }
}
async function listHalaqoh(req, res) {
  let {
    tahunAjaran,
    semester,
    statusKehadiran,
    dariTanggal,
    sampaiTanggal,
    namaMapel,
    page,
    pageSize,
  } = req.query;

  if (tahunAjaran !== undefined) {
    tahunAjaran = `AND a.tahun_ajaran = '${tahunAjaran}'`;
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
    statusKehadiran = `AND a.status_kehadiran = '${statusKehadiran}'`;
  } else {
    statusKehadiran = "";
  }
  if (namaMapel !== undefined) {
    namaMapel = `AND a.mapel_id = '${namaMapel}'`;
  } else {
    namaMapel = "";
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
  const absensi = await sequelize.query(
    `SELECT a.id , a.tanggal, b.nama_guru As nama_pengampu, c.nama_surat AS dari_surat,
     c.nama_surat_arabic AS dari_surat_arabic,a.dari_ayat, d.nama_surat AS sampai_surat, 
     d.nama_surat_arabic AS sampai_surat_arabic, a.sampai_ayat,a.halaman_terakhir, a.status_kehadiran,
     a.keterangan,a.semester, a.tahun_ajaran, a.created_at, a.updated_at  FROM absensi_halaqohs AS a 
     LEFT JOIN teachers AS b ON (a.teacher_id = b.id) LEFT JOIN alqurans AS c ON (a.dari_surat = c.id) 
     LEFT JOIN alqurans as d ON (a.sampai_surat = d.id) 
     WHERE a.student_id = ${req.StudentId}
     ${namaMapel}
     ${tahunAjaran}
     ${semester}
      ${tanggal}
      ${statusKehadiran}
     ORDER BY a.tanggal desc 
      ;`,
    {
      type: QueryTypes.SELECT,
    }
  );
  return res.json({
    status: "Success",
    msg: "Data  Absensi Halaqoh ditemukan",
    page: page + 1,
    nextPage: page + 2,
    previousPage: page - 2,
    pageSize: pageSize,
    totalData: absensi.length,
    data: absensi,
  });
}

async function resultHalaqoh(req, res) {
  let {
    tahunAjaran,
    semester,
    statusKehadiran,
    dariTanggal,
    sampaiTanggal,
    namaMapel,
    page,
    pageSize,
  } = req.query;

  if (tahunAjaran !== undefined) {
    tahunAjaran = `AND a.tahun_ajaran = '${tahunAjaran}'`;
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
    statusKehadiran = `AND a.status_kehadiran = '${statusKehadiran}'`;
  } else {
    statusKehadiran = "";
  }
  if (namaMapel !== undefined) {
    namaMapel = `AND a.mapel_id = '${namaMapel}'`;
  } else {
    namaMapel = "";
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
  const absensi = await sequelize.query(
    `(SELECT a.id , a.tanggal, b.nama_surat AS dari_surat, b.nama_surat_arabic AS dari_surat_arabic,a.dari_ayat, 
      c.nama_surat AS sampai_surat, c.nama_surat_arabic AS sampai_surat_arabic, a.sampai_ayat,a.halaman_terakhir,  a.created_at, a.updated_at  
      FROM absensi_halaqohs AS a 
      LEFT JOIN alqurans as b ON (a.dari_surat = b.id) 
      LEFT JOIN alqurans AS c ON (a.sampai_surat = c.id)  
      WHERE a.student_id = ${req.StudentId} ORDER BY a.tanggal ASC LIMIT 1)  
      UNION 
      (SELECT  a.id , a.tanggal, b.nama_surat AS dari_surat, b.nama_surat_arabic AS dari_surat_arabic,a.dari_ayat,
       c.nama_surat AS sampai_surat, c.nama_surat_arabic AS sampai_surat_arabic, a.sampai_ayat,a.halaman_terakhir,  a.created_at, a.updated_at  
       FROM absensi_halaqohs AS a  
       LEFT JOIN alqurans as b ON (a.dari_surat = b.id)
       LEFT JOIN alqurans AS c ON (a.sampai_surat = c.id) 
       WHERE a.student_id = ${req.StudentId} ORDER BY a.tanggal DESC LIMIT 1)`,
    {
      type: QueryTypes.SELECT,
    }
  );
  const jumlah = await sequelize.query(
    `(SELECT * FROM absensi_halaqohs AS a WHERE a.student_id = ${req.StudentId})`,
    {
      type: QueryTypes.SELECT,
    }
  );
  let jumlahHalaman = absensi[0].halaman_terakhir - absensi[1].halaman_terakhir
  let jumlahHari = jumlah.length
  return res.json({
    status: "Success",
    msg: "Data  Absensi Halaqoh ditemukan",
   
    data: {
      updateTanggal : absensi[1].created_at,
      hafalanAwal : {
        namaSurat : absensi[0].dari_surat,
        suratSuratDalamArabic : absensi[0].dari_surat_arabic,
        dariAyat : absensi[0].dari_ayat
      },
      hafalanUpdate : {
        namaSurat : absensi[1].dari_surat,
        suratSuratDalamArabic  : absensi[1].dari_surat_arabic,
        sampaiAyat : absensi[1].sampai_ayat
      },
      jumlahHafalanDalamHalaman : `${jumlahHalaman} halaman`,
      rataRataHalamanPerhari : `${jumlahHalaman  / jumlahHari} halaman perhari`
    },
  });
}
module.exports = { list, listHalaqoh,resultHalaqoh };

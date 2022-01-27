const AbsensiKelasModel = require("../../models").absensi_kelas;
const AbsensiHalaqohModel = require("../../models").absensi_halaqoh;
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const { formatDate } = require("../../utils/format");
const {paramsQueryAND} = require("../../utils/paramsQuery")
async function list(req, res) {
  try {
    let {
      tahunAjaran,
      semester,
      statusKehadiran,
      dariTanggal,
      sampaiTanggal,
      namaMapel,
      page,
      pageSize,
      orderBy
    } = req.query;

    if (tahunAjaran !== undefined) {
      tahunAjaran = `AND f.nama_tahun_ajaran = '${tahunAjaran}'`;
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
      statusKehadiran = `AND g.nama_status_kehadiran = '${statusKehadiran}'`;
    } else {
      statusKehadiran = "";
    }
    if (namaMapel !== undefined) {
      namaMapel = `AND d.nama_mapel = '${namaMapel}'`;
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
      if(process.env.DB_DIALECT === 'mysql') {
        limit = `LIMIT ${page}, ${pageSize}`;
      }else {
        limit = `LIMIT ${pageSize} OFFSET ${page}`;
      
      }
     
    }

    try {
      const absensi = await sequelize.query(
        `SELECT
        a.id,
        a.tanggal,
        e.nama_guru,
        h.materi,
        b.nama_siswa,
        c.nama_kelas,
        d.nama_mapel,
      h.jam_ke,
        g.nama_status_kehadiran AS status_kehadiran,
        a.keterangan,
        a.semester,
        f.nama_tahun_ajaran AS tahun_ajaran,
       
        a.created_at,
        a.updated_at
      FROM
        absensi_kelas AS a
      JOIN students AS b ON (a.student_id = b.id)
      JOIN kelas AS c ON (a.kelas_id = c.id)
      JOIN mapels AS d ON (a.mapel_id = d.id)
      JOIN teachers AS e ON (a.teacher_id = e.id)
      JOIN ta AS f ON (a.ta_id = f.id)
      JOIN status_kehadirans AS g ON (a.status_kehadiran = g.id)
      JOIN agenda_kelas AS h ON (a.tanggal = h.tanggal AND a.teacher_id = h.teacher_id AND a.mapel_id = h.mapel_id AND a.kelas_id = h.kelas_id  )
      WHERE
        a.student_id = ${req.StudentId} ${namaMapel} ${tahunAjaran} ${semester} ${tanggal} ${statusKehadiran} 
      ORDER BY
        a.tanggal ${orderBy} , h.jam_ke asc
       
  
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

      let hariPertama = absensi[absensi.length - 1];
      let hariTerakhir = absensi[0];
      if (orderBy === "desc") {
        periode = `${formatDate(hariPertama?.tanggal)} - ${formatDate(
          hariTerakhir?.tanggal
        )}`;
      } else {
        periode = `${formatDate(hariTerakhir?.tanggal)} - ${formatDate(
          hariPertama?.tanggal
        )}`;
      }
      return res.json({
        status: "Success",
        msg: "Data  Absensi Kelas ditemukan",
        periode :periode,
        page: page + 1,
        nextPage: page + 2,
        previousPage: page + 1 - 1,
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
  } catch (err) {
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function listHalaqoh(req, res) {
  try {
    let {
      tahunAjaran,
      semester,
      statusKehadiran,
      dariTanggal,
      sampaiTanggal,
      namaMapel,
      page,
      pageSize,
      orderBy,
    } = req.query;

    if (tahunAjaran !== undefined) {
      tahunAjaran = `AND e.nama_tahun_ajaran = '${tahunAjaran}'`;
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
      statusKehadiran = `AND f.nama_status_kehadiran = '${statusKehadiran}'`;
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
      if(process.env.DB_DIALECT === 'mysql') {
        limit = `LIMIT ${page}, ${pageSize}`;
      }else {
        limit = `LIMIT ${pageSize} OFFSET ${page}`;
      }
    }
    const absensi = await sequelize.query(
      `SELECT
      a.id,
      a.tanggal,
      b.nama_guru AS nama_pengampu,
      c.nama_surat AS dari_surat,
      c.nama_surat_arabic AS dari_surat_arabic,
      a.dari_ayat,
      d.nama_surat AS sampai_surat,
      d.nama_surat_arabic AS sampai_surat_arabic,
      a.sampai_ayat,
      a.total_halaman,
      f.nama_status_kehadiran AS status_kehadiran,
      a.keterangan,
      a.semester,
      e.nama_tahun_ajaran AS tahun_ajaran,
      a.created_at,
      a.updated_at
    FROM
      absensi_halaqohs AS a
    LEFT JOIN teachers AS b ON (a.teacher_id = b.id)
    LEFT JOIN alqurans AS c ON (a.dari_surat = c.id)
    LEFT JOIN alqurans AS d ON (a.sampai_surat = d.id)
    LEFT JOIN ta AS e ON (a.ta_id = e.id) 
    LEFT JOIN status_kehadirans AS f ON (a.status_kehadiran = f.id)
    WHERE
      a.student_id = ${req.StudentId} ${namaMapel} ${tahunAjaran} ${semester} ${tanggal} ${statusKehadiran}
    ORDER BY
      a.tanggal ${orderBy}
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
    let hariPertama = absensi[absensi.length - 1];
    let hariTerakhir = absensi[0];

    let periode = null;
    if (orderBy === "desc") {
      periode = `${formatDate(hariPertama?.tanggal)} - ${formatDate(
        hariTerakhir?.tanggal
      )}`;
    } else {
      periode = `${formatDate(hariTerakhir?.tanggal)} - ${formatDate(
        hariPertama?.tanggal
      )}`;
    }
    return res.json({
      status: "Success",
      msg: "Data  Absensi Halaqoh ditemukan",

      periode: periode,

      page: page + 1,
      nextPage: page + 2,
      previousPage: page + 1 - 1,
      pageSize: pageSize,
      totalData: absensi.length,
      data: absensi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
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
    `(SELECT
      a.id,
      a.tanggal,
      b.nama_surat AS dari_surat,
      b.nama_surat_arabic AS dari_surat_arabic,
      a.dari_ayat,
      c.nama_surat AS sampai_surat,
      c.nama_surat_arabic AS sampai_surat_arabic,
      a.sampai_ayat,
      a.total_halaman,
      a.juz_ke,
      a.created_at,
      a.updated_at
    FROM
      absensi_halaqohs AS a
      LEFT JOIN alqurans AS b ON (a.dari_surat = b.id)
      LEFT JOIN alqurans AS c ON (a.sampai_surat = c.id)
    WHERE
      a.student_id = ${req.StudentId}
   
    ORDER BY
      a.tanggal DESC )  
      `,
    {
      type: QueryTypes.SELECT,
    }
  );
  if (absensi.length === 0) {
    return res.json({
      status: "Fail",
      msg: "Tidak ditemukan absensi pada siswa yang bersangkutan",
    });
  }
  const jumlah = await sequelize.query(
    `(SELECT * FROM absensi_halaqohs AS a WHERE a.student_id =  ${req.StudentId})`,
    {
      type: QueryTypes.SELECT,
    }
  );

  return res.json({
    status: "Success",
    msg: "Data Pencapaian Halaqoh Santri",

    data: {
      updateTanggal: absensi[1]?.created_at,

      data: absensi,
    },
  });
}
module.exports = { list, listHalaqoh, resultHalaqoh };

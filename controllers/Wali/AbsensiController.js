const AbsensiKelasModel = require("../../models").absensi_kelas;
const AbsensiHalaqohModel = require("../../models").absensi_halaqoh;
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const { formatDate } = require("../../utils/format");

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
      orderBy,
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
      if (process.env.DB_DIALECT === "mysql") {
        limit = `LIMIT ${page}, ${pageSize}`;
      } else {
        limit = `LIMIT ${pageSize} OFFSET ${page}`;
      }
    }
    if (orderBy === undefined) {
      orderBy = "desc";
    }
    try {
      const absensi = await sequelize.query(
        `SELECT DISTINCT
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
      LEFT JOIN students AS b ON (a.student_id = b.id)
      LEFT JOIN kelas AS c ON (a.kelas_id = c.id)
      LEFT JOIN mapels AS d ON (a.mapel_id = d.id)
      LEFT JOIN teachers AS e ON (a.teacher_id = e.id)
      LEFT JOIN ta AS f ON (a.ta_id = f.id)
      LEFT JOIN status_kehadirans AS g ON (a.status_kehadiran = g.id)
      LEFT JOIN agenda_kelas AS h ON (a.tanggal = h.tanggal AND a.teacher_id = h.teacher_id AND a.mapel_id = h.mapel_id AND a.kelas_id = h.kelas_id  )
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
          msg: "Tidak ditemukan absensi kelas pada periode yang dipilih",
          student_id : req.StudentId
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

async function rekapAbsensiKehadiran(req, res) {
  let { tahunAjaran, semester, mapel } = req.query;
  if (tahunAjaran !== undefined) {
    tahunAjaran = `AND b.nama_tahun_ajaran = '${tahunAjaran}'`;
  } else {
    tahunAjaran = "";
  }
  // paramsQueryAND(tahunAjaran, 'tahunAjaran')
  if (semester !== undefined) {
    semester = `AND a.semester = '${semester}'`;
  } else {
    semester = "";
  }
  if (mapel !== undefined) {
    mapel = `AND c.nama_mapel = '${mapel}'`;
  } else {
    mapel = "";
  }
  try {
    const absensi = await sequelize.query(
      `SELECT
      COUNT(a.status_kehadiran) AS jumlah_absensi,
      COUNT( IF(a.status_kehadiran = 1, a.student_id, NULL)) AS hadir,
      COUNT( IF(a.status_kehadiran = 2, a.student_id , NULL)) AS sakit,
      COUNT( IF(a.status_kehadiran = 3, a.student_id , NULL)) AS izin,
      COUNT( IF(a.status_kehadiran = 4, a.student_id , NULL)) AS dispensasi,
      COUNT( IF(a.status_kehadiran = 5, a.student_id , NULL)) AS tanpa_keterangan
      
    FROM
      absensi_kelas AS a
      LEFT JOIN ta AS b ON (a.ta_id = b.id)
      LEFT JOIN mapels as c ON (a.mapel_id = c.id)
    
    WHERE
      a.student_id = ${req.StudentId} ${semester} ${tahunAjaran} ${mapel}
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    absensi[0].persentase_kehadiran =
      Math.round((absensi[0].hadir / absensi[0].jumlah_absensi) * 100) + " %";
    absensi[0].persentase_sakit =
      Math.round((absensi[0].sakit / absensi[0].jumlah_absensi) * 100) + " %";
    absensi[0].persentase_izin =
      Math.round((absensi[0].izin / absensi[0].jumlah_absensi) * 100) + " %";
    absensi[0].persentase_dispensasi =
      Math.round((absensi[0].dispensasi / absensi[0].jumlah_absensi) * 100) +
      "%";
    absensi[0].persentase_tanpa_keterangan =
      Math.round(
        (absensi[0].tanpa_keterangan / absensi[0].jumlah_absensi) * 100
      ) + "%";
    return res.json({
      status: "Success",
      mapel: req.query.mapel,
      semester: req.query.semester,
      tahunAjaran: req.query.tahunAjaran,
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
async function listHalaqoh(req, res) {
  try {
    let {
      tahunAjaran,
      semester,
      statusKehadiran,
      dariTanggal,
      sampaiTanggal,

      page,
      pageSize,
      orderBy,
    } = req.query;

    if (tahunAjaran !== undefined) {
      tahunAjaran = `AND h.nama_tahun_ajaran = '${tahunAjaran}'`;
    } else {
      tahunAjaran = "";
    }

    if (semester !== undefined) {
      semester = `AND b.semester = '${semester}'`;
    } else {
      semester = "";
    }
    if (statusKehadiran !== undefined) {
      statusKehadiran = `AND f.nama_status_kehadiran = '${statusKehadiran}'`;
    } else {
      statusKehadiran = "";
    }

    if (dariTanggal !== undefined && sampaiTanggal !== undefined) {
      tanggal = `AND a.tanggal BETWEEN  '${dariTanggal}' AND '${sampaiTanggal}' `;
    } else {
      tanggal = "";
    }
    let limit = "";
    if (page !== undefined && pageSize !== undefined) {
      if (process.env.DB_DIALECT === "mysql") {
        limit = `LIMIT ${page}, ${pageSize}`;
      } else {
        limit = `LIMIT ${pageSize} OFFSET ${page}`;
      }
    }

    if (orderBy === undefined) {
      orderBy = "desc";
    }
    const absensi = await sequelize.query(
      `SELECT
      a.id,
      a.tanggal,
      b.nama_kelompok,
      g.nama_guru,
      c.nama_surat AS dari_surat,
      c.nama_surat_arabic AS dari_surat_arabic,
      a.dari_ayat,
      d.nama_surat AS sampai_surat,
      d.nama_surat_arabic AS sampai_surat_arabic,
      a.sampai_ayat,
      a.total_halaman,
      a.tipe,
      f.nama_status_kehadiran AS status_kehadiran,
      b. semester AS semester  ,
      h. nama_tahun_ajaran AS tahun_ajaran,
      a.keterangan,
      a.created_at,
      a.updated_at
    FROM absensi_halaqohs AS a
    LEFT JOIN halaqohs AS b ON (a.halaqoh_id = b.id)
    LEFT JOIN alqurans AS c ON (a.dari_surat = c.id)
    LEFT JOIN alqurans AS d ON (a.sampai_surat = d.id)
  
    LEFT JOIN status_kehadirans AS f ON (a.status_kehadiran = f.id)
    LEFT JOIN teachers AS g ON (b.teacher_id = g.id)
    LEFT JOIN ta AS h ON (b.ta_id = h.id)
    WHERE
      a.student_id = ${req.StudentId}  ${semester} ${tahunAjaran}  ${tanggal} ${statusKehadiran}
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
module.exports = { list, listHalaqoh, resultHalaqoh, rekapAbsensiKehadiran };
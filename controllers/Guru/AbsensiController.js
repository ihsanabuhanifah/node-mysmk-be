const AbsensiKelasModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const JadwalModel = require("../../models").jadwal;
const LaporanGuruPiket = require("../../models").laporan_guru_piket;
const models = require("../../models");
const { Op, where } = require("sequelize");
const { check } = require("../../utils/paramsQuery");
const { checkQuery } = require("../../utils/format");
const excel = require("exceljs");
const { RESPONSE_API } = require("../../utils/response");

const response = new RESPONSE_API();

async function createJadwal(req, res) {
  let { data } = req.body;
  try {
    await JadwalModel.bulkCreate(data);
    return res.json({
      status: "Success",
      msg: "Jadwal Berhasil ditambahkan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function listJadwal(req, res) {
  try {
    const { hari } = req.query;
    const jadwal = await JadwalModel.findAndCountAll({
      attributes: ["id", "hari", "jam_ke", "jumlah_jam", "semester"],
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      where: {
        teacher_id: req.teacher_id,
        status: 1,
        ...(hari !== undefined && { hari: hari }),
      },
    });
    return res.json({
      status: "Success",
      msg: "Jadwal ditemukan",
      data: jadwal,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function listJadwalAll(req, res) {
  try {
    const { hari } = req.query;
    const jadwal = await JadwalModel.findAndCountAll({
      attributes: ["id", "hari", "jam_ke", "jumlah_jam", "semester"],
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      where: {
        status: 1,
        ...(hari !== undefined && { hari: hari }),
      },
    });
    return res.json({
      status: "Success",
      msg: "Jadwal ditemukan",
      data: jadwal,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function createAbsensi(req, res) {
  try {
    let {
      tanggal,
      semester,
      ta_id,
      kelas_id,
      mapel_id,
      absensi_kehadiran,
      agenda_kelas,
    } = req.body;

    const cek = await AbsensiKelasModel.findAll({
      attributes: ["id"],
      where: {
        [Op.and]: [
          { tanggal: tanggal },
          { kelas_id: kelas_id },
          { teacher_id: req.teacher_id },
          { mapel_id: mapel_id },
        ],
      },
    });

    if (cek.length !== 0) {
      return res.status(403).json({
        status: "Fail",
        msg: "Anda sudah mengabsen kelas ini",
      });
    }

    await absensi_kehadiran.map((data) => {
      (data.teacher_id = req.teacher_id),
        (data.tanggal = tanggal),
        (data.semester = semester),
        (data.ta_id = ta_id),
        (data.kelas_id = kelas_id),
        (data.mapel_id = mapel_id);
    });
    await agenda_kelas.map((data) => {
      (data.teacher_id = req.teacher_id),
        (data.tanggal = tanggal),
        (data.semester = semester),
        (data.ta_id = ta_id),
        (data.kelas_id = kelas_id),
        (data.mapel_id = mapel_id);
    });

    await AbsensiKelasModel.bulkCreate(absensi_kehadiran);
    await AgendaKelasModel.bulkCreate(agenda_kelas);

    return res.status(201).json({
      status: "Success",
      msg: "Absensi Berhasil di Simpan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function listAbsensi(req, res) {
  let {
    kelas_id,
    student_id,
    mapel_id,
    tahun_ajaran,
    status_kehadiran,
    semester,
    dariTanggal,
    sampaiTanggal,
    page,
    pageSize,
  } = req.query;
  try {
    const agenda = await AgendaKelasModel.findAll({
      // attributes: ["id","jam_ke" , "materi" , 'tanggal' , 'semester' , 'ta_id'],
      where: {
        ...(semester !== undefined && { semester: semester }),
        ...(dariTanggal !== undefined && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
          ...(mapel_id !== undefined && {
            mapel_id: mapel_id,
          }),
          ...(kelas_id !== undefined && {
            kelas_id: kelas_id,
          }),
          teacher_id: req.teacher_id,
        }),
      },
    });
    const absensi = await AbsensiKelasModel.findAll({
      attributes: ["id", "semester", "tanggal", "keterangan"],
      where: {
        ...(semester !== undefined && { semester: semester }),
        ...(dariTanggal !== undefined && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
        teacher_id: req.teacher_id,
      },
      order: [
        ["tanggal", "desc"],
        [{ model: models.student, as: "siswa" }, "nama_siswa", "asc"],
      ],
      // limit: pageSize,
      // offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: kelas_id !== undefined ? { id: kelas_id } : {},
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: student_id !== undefined ? { id: student_id } : {},
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
          where: mapel_id !== undefined ? { id: mapel_id } : {},
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
          where:
            tahun_ajaran !== undefined
              ? { nama_tahun_ajaran: tahun_ajaran }
              : {},
        },
        {
          model: models.status_kehadiran,
          require: true,
          as: "kehadiran",
          attributes: ["id", "nama_status_kehadiran"],
          where:
            status_kehadiran !== undefined
              ? { nama_status_kehadiran: status_kehadiran }
              : {},
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Absensi ditemukan",
      absensi,
      agenda,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function updateAbsensi(req, res) {
  try {
    let {
      // tanggal,
      // semester,
      // ta_id,
      // kelas_id,
      // mapel_id,
      absensi_kehadiran,
      agenda_kelas,
    } = req.body;

    await Promise.all(
      absensi_kehadiran.map(async (data) => {
        data.status_absensi = 1;
        await AbsensiKelasModel.update(data, {
          where: {
            id: data.id,
          },
        });
      })
    );
    await Promise.all(
      agenda_kelas.map(async (data) => {
        await AgendaKelasModel.update(data, {
          where: {
            id: data.id,
          },
        });
      })
    );

    return res.status(200).json({
      status: "Success",
      msg: "Absensi Kelas Berhasil di Simpan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

const notifikasiAbsensi = async (req, res) => {
  try {
    const notifikasi = await AbsensiKelasModel.findAll({
      attributes: ["id", "tanggal", "kelas_id"],
      where: {
        teacher_id: req.teacher_id,
        status_absensi: 0,
      },
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      order: [["tanggal", "desc"]],
      group: ["tanggal", "kelas_id"],
    });

    return res.json({
      status: "Success",
      msg: "notifikasi absensi",
      data: notifikasi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const guruBelumAbsen = async (req, res) => {
  try {
    const notifikasi = await AbsensiKelasModel.findAll({
      attributes: ["id", "tanggal", "kelas_id"],
      where: {
        status_absensi: 0,
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      group: ["tanggal", "kelas_id", "teacher_id", "mapel_id"],
      order: [["tanggal", "desc"]],
    });

    return res.json({
      status: "Success",
      msg: "notifikasi absensi",
      data: notifikasi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

async function rekapAbsensi(req, res) {
  let {
    nama_kelas,
    nama_siswa,
    nama_mapel,
    nama_guru,

    tahun_ajaran,
    status_kehadiran,
    semester,
    dariTanggal,
    sampaiTanggal,
    page,
    pageSize,
  } = req.query;
  try {
    const absensi = await AbsensiKelasModel.findAndCountAll({
      attributes: ["id", "semester", "tanggal", "keterangan"],

      where: {
        ...(checkQuery(semester) && {
          semester: semester,
        }),
        ...(checkQuery(dariTanggal) && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },
      order: [
        ["tanggal", "desc"],
        [{ model: models.student, as: "siswa" }, "nama_siswa", "asc"],
      ],
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: {
            ...(checkQuery(nama_kelas) && {
              nama_kelas: {
                [Op.substring]: nama_kelas,
              },
            }),
          },
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
          },
        },
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
          where: {
            ...(checkQuery(nama_guru) && {
              nama_guru: {
                [Op.substring]: nama_guru,
              },
            }),
          },
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
          where: {
            ...(checkQuery(nama_mapel) && {
              nama_mapel: {
                [Op.substring]: nama_mapel,
              },
            }),
          },
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],

          where: {
            ...(checkQuery(tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring]: tahun_ajaran,
              },
            }),
          },
        },
        {
          model: models.status_kehadiran,
          require: true,
          as: "kehadiran",
          attributes: ["id", "nama_status_kehadiran"],
          where: {
            ...(checkQuery(status_kehadiran) && {
              id: {
                [Op.substring]: status_kehadiran,
              },
            }),
          },
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Absensi ditemukan",
      page: req.page,
      pageSize: pageSize,
      absensi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function downloadExcelrekapAbsensi(req, res) {
  let {
    nama_kelas,
    nama_siswa,
    nama_mapel,
    nama_guru,
    teacher_id,
    tahun_ajaran,
    status_kehadiran,
    semester,
    dariTanggal,
    sampaiTanggal,
    page,
    pageSize,
  } = req.query;
  try {
    const absensi = await AbsensiKelasModel.findAll({
      attributes: ["id", "semester", "tanggal", "keterangan"],

      where: {
        ...(checkQuery(semester) && {
          semester: semester,
        }),
        ...(checkQuery(dariTanggal) && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },
      order: [
        ["tanggal", "desc"],
        [{ model: models.student, as: "siswa" }, "nama_siswa", "asc"],
      ],
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: {
            ...(checkQuery(nama_kelas) && {
              nama_kelas: {
                [Op.substring]: nama_kelas,
              },
            }),
          },
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
          },
        },
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
          where: {
            ...(checkQuery(nama_guru) && {
              nama_guru: {
                [Op.substring]: nama_guru,
              },
            }),
          },
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
          where: {
            ...(checkQuery(nama_mapel) && {
              nama_mapel: {
                [Op.substring]: nama_mapel,
              },
            }),
          },
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],

          where: {
            ...(checkQuery(tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring]: tahun_ajaran,
              },
            }),
          },
        },
        {
          model: models.status_kehadiran,
          require: true,
          as: "kehadiran",
          attributes: ["id", "nama_status_kehadiran"],
          where: {
            ...(checkQuery(status_kehadiran) && {
              id: {
                [Op.substring]: status_kehadiran,
              },
            }),
          },
        },
      ],
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Rekap Absensi");
    worksheet.columns = [
      { header: "No.", key: "no", width: 10 },
      { header: "Tanggal", key: "tanggal", width: 20 },
      { header: "Nama Siswa", key: "nSiswa", width: 20 },
      { header: "Kelas", key: "nKelas", width: 10 },
      { header: "Mata Pelajaran", key: "nMapel", width: 20 },
      { header: "Nama Guru", key: "nGuru", width: 20 },

      { header: "Status Kehadiran", key: "kehadiran", width: 20 },
      { header: "Keterangan", key: "keterangan", width: 20 },
      { header: "Semester", key: "semester", width: 20 },
      { header: "Tahun Pelajaran", key: "ta", width: 20 },
    ];

    absensi.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        tanggal: item.tanggal,
        nSiswa: item.siswa.nama_siswa,
        nKelas: item.kelas.nama_kelas,
        nMapel: item.mapel.nama_mapel,
        nGuru: item.teacher.nama_guru,
        kehadiran: item.kehadiran.nama_status_kehadiran,
        keterangan: item.keterangan,
        semester: item.semester,
        ta: item.tahun_ajaran.nama_tahun_ajaran,
      });
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
      err,
    });
  }
}

async function rekapAgenda(req, res) {
  let {
    nama_kelas,

    nama_mapel,
    nama_guru,

    tahun_ajaran,

    semester,
    dariTanggal,
    sampaiTanggal,
    page,
    pageSize,
  } = req.query;
  try {
    const absensi = await AgendaKelasModel.findAndCountAll({
      attributes: ["id", "materi", "jam_ke", "semester", "tanggal"],

      where: {
        ...(checkQuery(semester) && {
          semester: semester,
        }),
        ...(checkQuery(dariTanggal) && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },
      order: [["id", "desc"]],
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: {
            ...(checkQuery(nama_kelas) && {
              nama_kelas: {
                [Op.substring]: nama_kelas,
              },
            }),
          },
        },

        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
          where: {
            ...(checkQuery(nama_guru) && {
              nama_guru: {
                [Op.substring]: nama_guru,
              },
            }),
          },
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
          where: {
            ...(checkQuery(nama_mapel) && {
              nama_mapel: {
                [Op.substring]: nama_mapel,
              },
            }),
          },
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],

          where: {
            ...(checkQuery(tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring]: tahun_ajaran,
              },
            }),
          },
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Agenda Kelas ditemukan",
      page: req.page,
      pageSize: pageSize,
      absensi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

const agendaHarian = response.requestResponse(async (req, res) => {
  const { tanggal } = req.query;

  const agenda = await AgendaKelasModel.findAll({
    where: {
      tanggal: tanggal,
    },
    include: [
      {
        model: models.kelas,
        require: true,
        as: "kelas",
        attributes: ["id", "nama_kelas"],
      },
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
      },
      {
        model: models.mapel,
        require: true,
        as: "mapel",
        attributes: ["id", "nama_mapel"],
      },
    ],
  });

  const absensi = await AbsensiKelasModel.findAll({
    where: {
      tanggal: tanggal,
      status_kehadiran: {
        [Op.between]: [2, 5],
      },
    },

    include: [
      {
        model: models.student,
        require: true,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
      },
    ],
  });

  return {
    absensi: absensi,
    agenda: agendaGrup(agenda, absensi),
    //
    // absensi : absensi
  };
});

module.exports = {
  createAbsensi,
  listAbsensi,
  updateAbsensi,
  listJadwal,
  notifikasiAbsensi,
  guruBelumAbsen,
  rekapAbsensi,
  downloadExcelrekapAbsensi,
  rekapAgenda,
  listJadwalAll,
  createJadwal,
  agendaHarian,
};

function agendaGrup(agendas, absensi) {
  const groupedByClass = agendas.reduce((acc, agenda) => {
    const {
      kelas_id,
      kelas: { nama_kelas },
    } = agenda;

    if (!acc[kelas_id]) {
      acc[kelas_id] = {
        kelas_id,
        nama_kelas,
        agendas: [],
      };
    }

    // Mencari siswa yang tidak hadir berdasarkan kriteria tertentu
    const siswaTidakHadir = absensi.filter((item) => 
      item.mapel_id === agenda.mapel_id &&
      item.teacher_id === agenda.teacher_id &&
      item.kelas_id === agenda.kelas_id
    );
    
    // Menambahkan siswa yang tidak hadir ke dalam agenda
    agenda.siswa = siswaTidakHadir;
    
    // Menambahkan agenda yang telah diperbarui ke grup kelas
    acc[kelas_id].agendas.push({agenda:agenda, siswa:siswaTidakHadir});
    
    return acc;
  }, {});

  return Object.values(groupedByClass);
}

// [
//   {
//       "id": 1005,
//       "tanggal": "2024-08-29",
//       "mapel_id": 111,
//       "kelas_id": 2,
//       "teacher_id": 1,
//       "jam_ke": 3,
//       "materi": "Bab Mensholati Jenazah ",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:18:22.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 111,
//           "nama_mapel": "Fiqih 3"
//       }
//   },
//   {
//       "id": 1006,
//       "tanggal": "2024-08-29",
//       "mapel_id": 103,
//       "kelas_id": 2,
//       "teacher_id": 13,
//       "jam_ke": 3,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 13,
//           "nama_guru": "Rizqi Faturrakhman"
//       },
//       "mapel": {
//           "id": 103,
//           "nama_mapel": "Mobile Develoment 3"
//       }
//   },
//   {
//       "id": 1007,
//       "tanggal": "2024-08-29",
//       "mapel_id": 114,
//       "kelas_id": 2,
//       "teacher_id": 1,
//       "jam_ke": 7,
//       "materi": "Hukum Nun mati dan Tanwin\nQS. Al-Baqarah ayat 6 - 16",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:16:58.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 114,
//           "nama_mapel": "Tajwid 3"
//       }
//   },
//   {
//       "id": 1008,
//       "tanggal": "2024-08-29",
//       "mapel_id": 111,
//       "kelas_id": 3,
//       "teacher_id": 1,
//       "jam_ke": 1,
//       "materi": "Bab Mensholati Jenazah ",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:17:47.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 111,
//           "nama_mapel": "Fiqih 3"
//       }
//   },
//   {
//       "id": 1009,
//       "tanggal": "2024-08-29",
//       "mapel_id": 105,
//       "kelas_id": 3,
//       "teacher_id": 8,
//       "jam_ke": 3,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 8,
//           "nama_guru": "Raihan Kamal Ibrahim, Amd.Kom"
//       },
//       "mapel": {
//           "id": 105,
//           "nama_mapel": "Server Administration 3"
//       }
//   },
//   {
//       "id": 1010,
//       "tanggal": "2024-08-29",
//       "mapel_id": 114,
//       "kelas_id": 3,
//       "teacher_id": 1,
//       "jam_ke": 7,
//       "materi": "Hukum Nun mati dan Tanwin\nQS. Al-Baqarah ayat 6 - 16",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:19:11.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 114,
//           "nama_mapel": "Tajwid 3"
//       }
//   },
//   {
//       "id": 1011,
//       "tanggal": "2024-08-29",
//       "mapel_id": 154,
//       "kelas_id": 4,
//       "teacher_id": 19,
//       "jam_ke": 1,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 19,
//           "nama_guru": "Dedi Hidayatullah , S.Pd"
//       },
//       "mapel": {
//           "id": 154,
//           "nama_mapel": "Bahasa Indonesia 5"
//       }
//   },
//   {
//       "id": 1012,
//       "tanggal": "2024-08-29",
//       "mapel_id": 161,
//       "kelas_id": 4,
//       "teacher_id": 5,
//       "jam_ke": 3,
//       "materi": "Integrasi Apache Kafka di NestJS sebagai Consumer",
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-09-01T14:01:28.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 5,
//           "nama_guru": "Ihsan Santana Wibawa, S.Pd"
//       },
//       "mapel": {
//           "id": 161,
//           "nama_mapel": "Backend Development 5"
//       }
//   },
//   {
//       "id": 1013,
//       "tanggal": "2024-08-29",
//       "mapel_id": 154,
//       "kelas_id": 5,
//       "teacher_id": 19,
//       "jam_ke": 1,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 19,
//           "nama_guru": "Dedi Hidayatullah , S.Pd"
//       },
//       "mapel": {
//           "id": 154,
//           "nama_mapel": "Bahasa Indonesia 5"
//       }
//   },
//   {
//       "id": 1014,
//       "tanggal": "2024-08-29",
//       "mapel_id": 164,
//       "kelas_id": 5,
//       "teacher_id": 4,
//       "jam_ke": 3,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 4,
//           "nama_guru": "Fathi Muhammad Shalahuddin"
//       },
//       "mapel": {
//           "id": 164,
//           "nama_mapel": "Network Administration 5"
//       }
//   },
//   {
//       "id": 1015,
//       "tanggal": "2024-08-29",
//       "mapel_id": 165,
//       "kelas_id": 5,
//       "teacher_id": 8,
//       "jam_ke": 7,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 8,
//           "nama_guru": "Raihan Kamal Ibrahim, Amd.Kom"
//       },
//       "mapel": {
//           "id": 165,
//           "nama_mapel": "Server Administration 5"
//       }
//   },
//   {
//       "id": 1016,
//       "tanggal": "2024-08-29",
//       "mapel_id": 111,
//       "kelas_id": 2,
//       "teacher_id": 1,
//       "jam_ke": 4,
//       "materi": "Bab Mensholati Jenazah ",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:18:22.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 111,
//           "nama_mapel": "Fiqih 3"
//       }
//   },
//   {
//       "id": 1017,
//       "tanggal": "2024-08-29",
//       "mapel_id": 103,
//       "kelas_id": 2,
//       "teacher_id": 13,
//       "jam_ke": 4,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 13,
//           "nama_guru": "Rizqi Faturrakhman"
//       },
//       "mapel": {
//           "id": 103,
//           "nama_mapel": "Mobile Develoment 3"
//       }
//   },
//   {
//       "id": 1018,
//       "tanggal": "2024-08-29",
//       "mapel_id": 114,
//       "kelas_id": 2,
//       "teacher_id": 1,
//       "jam_ke": 8,
//       "materi": "Hukum Nun mati dan Tanwin\nQS. Al-Baqarah ayat 6 - 16",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:16:58.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 114,
//           "nama_mapel": "Tajwid 3"
//       }
//   },
//   {
//       "id": 1019,
//       "tanggal": "2024-08-29",
//       "mapel_id": 105,
//       "kelas_id": 3,
//       "teacher_id": 8,
//       "jam_ke": 4,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 8,
//           "nama_guru": "Raihan Kamal Ibrahim, Amd.Kom"
//       },
//       "mapel": {
//           "id": 105,
//           "nama_mapel": "Server Administration 3"
//       }
//   },
//   {
//       "id": 1020,
//       "tanggal": "2024-08-29",
//       "mapel_id": 114,
//       "kelas_id": 3,
//       "teacher_id": 1,
//       "jam_ke": 8,
//       "materi": "Hukum Nun mati dan Tanwin\nQS. Al-Baqarah ayat 6 - 16",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:19:11.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 114,
//           "nama_mapel": "Tajwid 3"
//       }
//   },
//   {
//       "id": 1021,
//       "tanggal": "2024-08-29",
//       "mapel_id": 154,
//       "kelas_id": 4,
//       "teacher_id": 19,
//       "jam_ke": 2,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 19,
//           "nama_guru": "Dedi Hidayatullah , S.Pd"
//       },
//       "mapel": {
//           "id": 154,
//           "nama_mapel": "Bahasa Indonesia 5"
//       }
//   },
//   {
//       "id": 1022,
//       "tanggal": "2024-08-29",
//       "mapel_id": 161,
//       "kelas_id": 4,
//       "teacher_id": 5,
//       "jam_ke": 4,
//       "materi": "Integrasi Apache Kafka di NestJS sebagai Consumer",
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-09-01T14:01:28.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 5,
//           "nama_guru": "Ihsan Santana Wibawa, S.Pd"
//       },
//       "mapel": {
//           "id": 161,
//           "nama_mapel": "Backend Development 5"
//       }
//   },
//   {
//       "id": 1023,
//       "tanggal": "2024-08-29",
//       "mapel_id": 111,
//       "kelas_id": 3,
//       "teacher_id": 1,
//       "jam_ke": 2,
//       "materi": "Bab Mensholati Jenazah ",
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-29T08:17:47.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 1,
//           "nama_guru": "Furqon Kholilulloh, S.Pd"
//       },
//       "mapel": {
//           "id": 111,
//           "nama_mapel": "Fiqih 3"
//       }
//   },
//   {
//       "id": 1024,
//       "tanggal": "2024-08-29",
//       "mapel_id": 154,
//       "kelas_id": 5,
//       "teacher_id": 19,
//       "jam_ke": 2,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 19,
//           "nama_guru": "Dedi Hidayatullah , S.Pd"
//       },
//       "mapel": {
//           "id": 154,
//           "nama_mapel": "Bahasa Indonesia 5"
//       }
//   },
//   {
//       "id": 1025,
//       "tanggal": "2024-08-29",
//       "mapel_id": 164,
//       "kelas_id": 5,
//       "teacher_id": 4,
//       "jam_ke": 4,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 4,
//           "nama_guru": "Fathi Muhammad Shalahuddin"
//       },
//       "mapel": {
//           "id": 164,
//           "nama_mapel": "Network Administration 5"
//       }
//   },
//   {
//       "id": 1026,
//       "tanggal": "2024-08-29",
//       "mapel_id": 165,
//       "kelas_id": 5,
//       "teacher_id": 8,
//       "jam_ke": 8,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 8,
//           "nama_guru": "Raihan Kamal Ibrahim, Amd.Kom"
//       },
//       "mapel": {
//           "id": 165,
//           "nama_mapel": "Server Administration 5"
//       }
//   },
//   {
//       "id": 1027,
//       "tanggal": "2024-08-29",
//       "mapel_id": 103,
//       "kelas_id": 2,
//       "teacher_id": 13,
//       "jam_ke": 5,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 13,
//           "nama_guru": "Rizqi Faturrakhman"
//       },
//       "mapel": {
//           "id": 103,
//           "nama_mapel": "Mobile Develoment 3"
//       }
//   },
//   {
//       "id": 1028,
//       "tanggal": "2024-08-29",
//       "mapel_id": 105,
//       "kelas_id": 3,
//       "teacher_id": 8,
//       "jam_ke": 5,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 8,
//           "nama_guru": "Raihan Kamal Ibrahim, Amd.Kom"
//       },
//       "mapel": {
//           "id": 105,
//           "nama_mapel": "Server Administration 3"
//       }
//   },
//   {
//       "id": 1029,
//       "tanggal": "2024-08-29",
//       "mapel_id": 161,
//       "kelas_id": 4,
//       "teacher_id": 5,
//       "jam_ke": 5,
//       "materi": "Integrasi Apache Kafka di NestJS sebagai Consumer",
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-09-01T14:01:28.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 5,
//           "nama_guru": "Ihsan Santana Wibawa, S.Pd"
//       },
//       "mapel": {
//           "id": 161,
//           "nama_mapel": "Backend Development 5"
//       }
//   },
//   {
//       "id": 1030,
//       "tanggal": "2024-08-29",
//       "mapel_id": 164,
//       "kelas_id": 5,
//       "teacher_id": 4,
//       "jam_ke": 5,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 4,
//           "nama_guru": "Fathi Muhammad Shalahuddin"
//       },
//       "mapel": {
//           "id": 164,
//           "nama_mapel": "Network Administration 5"
//       }
//   },
//   {
//       "id": 1031,
//       "tanggal": "2024-08-29",
//       "mapel_id": 103,
//       "kelas_id": 2,
//       "teacher_id": 13,
//       "jam_ke": 6,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 2,
//           "nama_kelas": "XI Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 13,
//           "nama_guru": "Rizqi Faturrakhman"
//       },
//       "mapel": {
//           "id": 103,
//           "nama_mapel": "Mobile Develoment 3"
//       }
//   },
//   {
//       "id": 1032,
//       "tanggal": "2024-08-29",
//       "mapel_id": 105,
//       "kelas_id": 3,
//       "teacher_id": 8,
//       "jam_ke": 6,
//       "materi": null,
//       "semester": 3,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 3,
//           "nama_kelas": "XI Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 8,
//           "nama_guru": "Raihan Kamal Ibrahim, Amd.Kom"
//       },
//       "mapel": {
//           "id": 105,
//           "nama_mapel": "Server Administration 3"
//       }
//   },
//   {
//       "id": 1033,
//       "tanggal": "2024-08-29",
//       "mapel_id": 161,
//       "kelas_id": 4,
//       "teacher_id": 5,
//       "jam_ke": 6,
//       "materi": "Mengerjakan Project",
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-09-01T14:01:28.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 5,
//           "nama_guru": "Ihsan Santana Wibawa, S.Pd"
//       },
//       "mapel": {
//           "id": 161,
//           "nama_mapel": "Backend Development 5"
//       }
//   },
//   {
//       "id": 1034,
//       "tanggal": "2024-08-29",
//       "mapel_id": 164,
//       "kelas_id": 5,
//       "teacher_id": 4,
//       "jam_ke": 6,
//       "materi": null,
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-08-28T17:06:00.000Z",
//       "kelas": {
//           "id": 5,
//           "nama_kelas": "XII Teknik Komputer dan Jaringan"
//       },
//       "teacher": {
//           "id": 4,
//           "nama_guru": "Fathi Muhammad Shalahuddin"
//       },
//       "mapel": {
//           "id": 164,
//           "nama_mapel": "Network Administration 5"
//       }
//   },
//   {
//       "id": 1035,
//       "tanggal": "2024-08-29",
//       "mapel_id": 161,
//       "kelas_id": 4,
//       "teacher_id": 5,
//       "jam_ke": 7,
//       "materi": "Mengerjakan Project",
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-09-01T14:01:28.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 5,
//           "nama_guru": "Ihsan Santana Wibawa, S.Pd"
//       },
//       "mapel": {
//           "id": 161,
//           "nama_mapel": "Backend Development 5"
//       }
//   },
//   {
//       "id": 1036,
//       "tanggal": "2024-08-29",
//       "mapel_id": 161,
//       "kelas_id": 4,
//       "teacher_id": 5,
//       "jam_ke": 8,
//       "materi": "Mengerjakan Project",
//       "semester": 5,
//       "ta_id": 3,
//       "createdAt": "2024-08-28T17:06:00.000Z",
//       "updatedAt": "2024-09-01T14:01:28.000Z",
//       "kelas": {
//           "id": 4,
//           "nama_kelas": "XII Rekayasa Perangkat Lunak"
//       },
//       "teacher": {
//           "id": 5,
//           "nama_guru": "Ihsan Santana Wibawa, S.Pd"
//       },
//       "mapel": {
//           "id": 161,
//           "nama_mapel": "Backend Development 5"
//       }
//   }
// ]

// bagaimana membuat function untuk merubah obejct dalam aray dengan format sebagai berikut dengan nama_kelas sebagai gruping di atas menjadi

// [
//   {
//     "nama_kelas" :
//     "jam_ke_1" : {
//       "mater" : ,
//       "nama_guru" : ,
//     },
//     "jam_ke_2" : {
//       "mater" : ,
//       "nama_guru" : ,
//     } ,
//     "jam_ke_3" : {
//       "mater" : ,
//       "nama_guru" : ,
//     }

//     sampai jam ke 8

//   }
// ]

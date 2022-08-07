const AbsensiKelasModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const JadwalModel = require("../../models").jadwal;
const LaporanGuruPiket = require("../../models").laporan_guru_piket;
const models = require("../../models");
const { Op } = require("sequelize");
const { check } = require("../../utils/paramsQuery");
const { checkQuery } = require("../../utils/format");
const excel = require("exceljs");

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
      order: [
        ["id", "desc"],
       
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

module.exports = {
  createAbsensi,
  listAbsensi,
  updateAbsensi,
  listJadwal,
  notifikasiAbsensi,
  guruBelumAbsen,
  rekapAbsensi,
  downloadExcelrekapAbsensi,
  rekapAgenda
};

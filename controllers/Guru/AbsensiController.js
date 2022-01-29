const AbsensiKelasModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const models = require("../../models");
const { Op } = require("sequelize");
const {check} = require("../../utils/paramsQuery")
 
async function create(req, res) {
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

async function index(req, res) {
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
    pageSize
  } = req.query;
  try {
    const data = await AbsensiKelasModel.findAll({
      attributes: ["id", "semester", "tanggal", "keterangan"],
      where: {
        ...(semester !== undefined && { semester: semester }),
        ...(dariTanggal !== undefined && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },
      order : [['tanggal' , 'desc']],
      limit : pageSize,
      offset : page,
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
      data: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { create, index };

const AbsensiKelasModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const { Op } = require("sequelize");

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

async function index(req, res) {}

module.exports = { create, index };

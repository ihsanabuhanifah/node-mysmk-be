const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const { checkQuery } = require("../../utils/format");

const listPenilaianByTeacher = async (req, res) => {
  let = { mapel_id, ujian_id, page, pageSize } = req.query;

  try {
    const soals = await NilaiController.findAll({
      // attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
      where: {
        teacher_id: req.teacher_id,
        ujian_id: ujian_id,
        ...(checkQuery(mapel_id) && {
          mapel_id: mapel_id,
        }),
      },
      include: [
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
        },
        {
          model: models.ujian,
          require: true,
          as: "ujian",
          attributes: [
            "id",
            "jenis_ujian",
            "tipe_ujian",
            "waktu_mulai",
            "waktu_selesai",
            "status",
          ],
        },
      ],
      limit: pageSize,
      offset: page,
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: soals,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

module.exports = {
  listPenilaianByTeacher,
};

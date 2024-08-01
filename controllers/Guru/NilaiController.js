const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const { checkQuery } = require("../../utils/format");
const { RESPONSE_API } = require("../../utils/response");

const response = new RESPONSE_API();

const remidial = response.requestResponse(async (req, res) => {
  const { payload } = req.body;

  await NilaiController.update(
    { remidial_count: 1, status: "open" },
    {
      where: {
        teacher_id: req.teacher_id,

        id: {
          [Op.in]: payload, // arrayOfIds adalah array yang berisi ID-ID yang ingin di-update
        },
      },
    }
  );

  return {
    status: "Success",
    msg: "Daftar remidial berhasil di perbaharui",
  };
});

const refreshCount = response.requestResponse(async (req, res) => {
  const { payload } = req.body;

  await NilaiController.update(
    { refresh_count: 3 },
    {
      where: {
        teacher_id: req.teacher_id,

        id: {
          [Op.in]: payload, // arrayOfIds adalah array yang berisi ID-ID yang ingin di-update
        },
      },
    }
  );

  return {
    status: "Success",
    msg: "Siswa sudah bisa ujian kembali",
  };
});

const listPenilaianByTeacher = response.requestResponse(async (req, res) => {
  let = { mapel_id, ujian_id, page, pageSize } = req.query;

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
          "durasi",
        ],
      },
    ],
    limit: pageSize,
    offset: page,
  });
  return {
    msg: "Berhasil ditemukan",
    page: req.page,
    pageSize: pageSize,
    data: soals,
  };
});

module.exports = {
  listPenilaianByTeacher,
  remidial,
  refreshCount,
};

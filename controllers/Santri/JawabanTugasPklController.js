const JawabanTugasPklModel = require("../../models").jawaban_tugas_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const StudentModel = require("../../models").student;
const { checkQuery, formatDate } = require("../../utils/format");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const createJawabanTugasPkl = response.requestResponse(async (req, res) => {
  let payload = req.body;

  const jawabanTugasPayload = await JawabanTugasPklModel.create({
    ...payload,
    student_id: req.student_id,
    tanggal: dayjs(new Date()).format("YYYY-MM-DD"),
    
  });

  return {
    statusCode: 201,
    status: "success",
    message: "Jawaban Berhasil Dibuat",
    data: jawabanTugasPayload,
  };
});
const updateJawabanTugasPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params; // Mengambil ID jawaban dari params
  let payload = req.body;

  // Mengambil jawaban berdasarkan ID
  const jawabanTugas = await JawabanTugasPklModel.findOne({ where: { id } });

  if (!jawabanTugas) {
    return {
      statusCode: 404,
      status: "fail",
      message: "Jawaban tidak ditemukan",
    };
  }

  // Update jawaban dengan payload yang baru
  await jawabanTugas.update({
    ...payload,
    updated_at: new Date(), // Update tanggal untuk update_at
  });

  return {
    statusCode: 200,
    status: "success",
    message: "Jawaban Berhasil Diupdate",
    data: jawabanTugas,
  };
});
const getDetailJawabanTugasPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const jawabanTugas = await JawabanTugasPklModel.findOne({
    where: { tugas_pkl_id: id },
    include: [
      {
        model: StudentModel,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
      },
    ],
  });

  if (!jawabanTugas) {
    return {
      statusCode: 404,
      status: "fail",
      message: "Jawaban tidak ditemukan",
    };
  }

  return {
    statusCode: 200,
    status: "success",
    message: "Detail Jawaban Berhasil Ditemukan",
    data: jawabanTugas,
  };
});

module.exports = {
  createJawabanTugasPkl,
  updateJawabanTugasPkl,
  getDetailJawabanTugasPkl,
};

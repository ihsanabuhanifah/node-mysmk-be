const { where } = require("sequelize");
const models = require("../../models");
const {
  calculateMinutesDifference,
  calculateWaktuSelesai,
} = require("../../utils/format");
const nilaiPPdbController = require("../../models").nilai_ppdb;
const BankSoalController = require("../../models").bank_soal;
const { RESPONSE_API } = require("../../utils/response");

const response = new RESPONSE_API();

const getExamPpdb = response.requestResponse(async (req, res) => {
  const { page, pageSize } = req.query;

  const exam = await nilaiPPdbController.findAndCountAll({
    ...(pageSize !== undefined && { limit: pageSize }),
    ...(page !== undefined && { offset: page }),
    where: {
      user_id: req.id,
    },
    attributes: {
      exclude: "jawaban",
    },
    include: [
      {
        model: models.ujian,
        require: true,
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
    order: [["id", "desc"]],
    limit: pageSize,
    offset: page,
  });
  return {
    msg: "Data Ujian berhasil ditemukan",
    data: exam,
    limit: pageSize,
    offset: page,
    page: req.page,
    pageSize: pageSize,
  };
});

const takeExamPpdb = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const exam = await nilaiPPdbController.findOne({
    where: { id: id, user_id: req.id },
    include: [
      {
        model: models.ujian,
        require: true,
        attributes: [
          "id",
          "judul_ujian",
          "jenis_ujian",
          "waktu_mulai",
          "waktu_selesai",
          "status",
          "durasi",
          "soal",
        ],
      },
    ],
  });

  if (!exam) {
    return { statusCode: 422, msg: "Ujian tidak ditemukan" };
  }

  const now = new Date();
  const startTime = new Date(exam.ujian.waktu_mulai);
  const endTime = new Date(exam.ujian.waktu_selesai);

  // if (exam.status === "finish") {
  //   return { statusCode: 422, msg: "Ujian telah selesai" };
  // }

  // if (now < startTime) {
  //   return { statusCode: 422, msg: "Ujian belum dimulai" };
  // }

  // if (now > endTime) {
  //   return { statusCode: 422, msg: "Waktu ujian telah berakhir" };
  // }

  const soal = JSON.parse(exam.ujian.soal).sort(() => Math.random() - 0.5);

  await nilaiPPdbController.update(
    { status: "progress", jawaban: JSON.stringify([]) },
    { where: { id: exam.id } }
  );

  return {
    msg: "Ujian dimulai",
    soal: soal,
    // waktu_tersisa: calculateMinutesDifference(now, endTime) * 60,
  };
});

const submitExamPpdb = response.requestResponse(async (req, res) => {
  const { id } = req.body;
  const jawaban = req.body.jawaban;

  const exam = await nilaiPPdbController.findOne({
    where: { id: id, user_id: req.id },
    include: [
      {
        model: models.ujian,
        attributes: ["id", "soal"],
      },
    ],
  });

  if (!exam) {
    return { statusCode: 422, msg: "Ujian tidak ditemukan" };
  }

  if (exam.status === "finish") {
    return { statusCode: 422, msg: "Ujian telah selesai" };
  }

  const soal = JSON.parse(exam.ujian.soal);
  let totalPoint = 0;
  let achievedPoint = 0;

  soal.forEach((item) => {
    totalPoint += item.point;
    const userAnswer = jawaban.find((ans) => ans.id === item.id);
    console.log("Item soal:", item);
    console.log("Jawaban pengguna untuk item ini:", userAnswer);
    if (userAnswer && userAnswer.jawaban === item.jawaban) {
      achievedPoint += item.point;
      console.log("Jawaban benar, point bertambah:", achievedPoint);
    }
  });

  const nilai = Math.ceil((achievedPoint / totalPoint) * 100);

  const result = await nilaiPPdbController.update(
    {
      status: "finish",
      jawaban: JSON.stringify(jawaban),
      is_lulus: nilai >= 75 ? 1 : 0,
    },
    { where: { id: exam.id } }
  );
  console.log("Total point:", totalPoint);
  console.log("Achieved point:", achievedPoint);
  console.log("Soal dari ujian:", exam.ujian.soal);
  console.log("Jawaban pengguna:", jawaban);
  console.log("Hasil update:", result);
  return {
    msg: "Jawaban berhasil disimpan",
    nilai: nilai,
    lulus: nilai >= 75 ? "Ya" : "Tidak",
  };
});

module.exports = {
  getExamPpdb,
  takeExamPpdb,
  submitExamPpdb,
};

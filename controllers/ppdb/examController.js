const { Op, where } = require("sequelize");
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
        attributes: ["id", "jenis_ujian", "tipe_ujian", "status"],
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
  const { ujian_id } = req.params;

  const exam = await nilaiPPdbController.findOne({
    where: { ujian_id: ujian_id, user_id: req.id },
    include: [
      {
        model: models.ujian,
        require: true,
        attributes: ["id", "judul_ujian", "jenis_ujian", "soal"],
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
  const { id, data: jawaban } = req.body;
  const exam = await nilaiPPdbController.findOne({
    where: {
      id: id,
      user_id: req.id,
    },
    include: [
      {
        model: models.ujian,
        attributes: ["id", "soal"],
      },
    ],
  });

  if (!exam) {
    return {
      statusCode: 422,
      msg: "Ujian tidak ditemukan",
    };
  }

  if (exam.status === "finish") {
    return {
      statusCode: 422,
      msg: "Ujian telah selesai",
    };
  }

  if (exam.status === "open") {
    return {
      statusCode: 422,
      msg: "Ujian belum dimulai",
    };
  }
  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.ujian.soal),
      },
    },
  });
  if (soal.length === 0) {
    console.log("Tidak ada soal ditemukan.");
  } else {
    soal.forEach((item) => {
      console.log(`Soal ID: ${item.id}, Poin: ${item.point}`);
    });
  }
  let totalPoint = 0;
  let achievedPoint = 0;
  soal.forEach((item) => {
    if (item.point) {
      totalPoint += item.point;
    } else {
      console.log(`Soal ID: ${item.id} tidak memiliki poin.`);
    }
    console.log(`Memeriksa soal ID: ${item.id}, Jawaban Soal: ${item.jawaban}`);
    jawaban.forEach((jawab) => {
      console.log(
        `Jawaban ID: ${jawab.id}, Jawaban Pengguna: ${jawab.jawaban}`
      );
      if (jawab.id === item.id) {
        console.log("ID cocok, memeriksa jawaban");
        if (jawab.jawaban.toLowerCase() === item.jawaban.toLowerCase()) {
          achievedPoint += item.point;
          console.log(
            `Jawaban benar! Poin ditambahkan: ${item.point}, Total Achieved Point: ${achievedPoint}`
          );
        } else {
          console.log("Jawaban tidak cocok");
        }
      }
    });
  });
  let nilai = 0;
  if (totalPoint === 0) {
    console.log("Error: Total Point is 0!");
  } else {
    nilai = (achievedPoint / totalPoint) * 100;
    nilai = Math.ceil(nilai);
    console.log("Nilai:", nilai);
  }

  await nilaiPPdbController.update(
    {
      status: "finish",
      jawaban: JSON.stringify(jawaban),
      is_lulus: nilai >= 75 ? 1 : 0,
    },
    {
      where: {
        id: exam.id,
      },
    }
  );
  console.log("soal", soal);
  console.log("Jawaban Pengguna:", JSON.stringify(jawaban, null, 2));
  console.log("Soal yang diambil:", JSON.stringify(soal, null, 2));
  console.log(`Achieved Point sebelum perhitungan: ${achievedPoint}`);
  console.log(`Total Point: ${totalPoint}`);
  return {
    msg: "Jawaban berhasil tersimpan",
    nilai,
    lulus: nilai >= 75 ? "Ya" : "Tidak",
    totalPoint,
    achievedPoint,
  };
});

module.exports = {
  getExamPpdb,
  takeExamPpdb,
  submitExamPpdb,
};

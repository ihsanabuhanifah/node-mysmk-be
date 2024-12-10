const { Op, where } = require("sequelize");
const models = require("../../models");
const {
  calculateMinutesDifference,
  calculateWaktuSelesai,
} = require("../../utils/format");
const nilaiPPdbController = require("../../models").nilai_ppdb;
const BankSoalController = require("../../models").bank_soal;
const { RESPONSE_API } = require("../../utils/response");
const moment = require("moment-timezone");
const formatIndonesia = (date) =>
  moment(date).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm:ss");
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
        attributes: [
          "id",
          "jenis_ujian",
          "tipe_ujian",
          "waktu_mulai",
          "waktu_selesai",
          "status",
          "soal",
          "durasi",
        ],
      },
    ],
  });

  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.ujian.soal),
      },
    },
    attributes: ["soal"],
  });
  if (!exam) {
    return { statusCode: 422, msg: "Ujian tidak ditemukan" };
  }
  if (exam.status === "finish") {
    return {
      statusCode: 422,
      msg: "Ujian telah berakhir",
    };
  }

  const now = moment().tz("Asia/Jakarta").toDate();
  const startTime = moment(exam.ujian.waktu_mulai).tz("Asia/Jakarta").toDate();
  const endTime = moment(exam.ujian.waktu_selesai).tz("Asia/Jakarta").toDate();

  if (
    (now >= startTime && now <= endTime) ||
    exam.ujian.tipe_ujian === "open" ||
    exam.status === "progress"
  ) {
    soal = soal.map((item) => {
      return {
        id: item.id,
        soal: item.soal,
        point: item.point,
      };
    });

    if (exam.status === "open") {
      const currentTime = moment().tz("Asia/Jakarta").toDate();
      await nilaiPPdbController.update(
        {
          status: "progress",
          jawaban: JSON.stringify([]),
          jam_mulai: currentTime,
          waktu_tersisa: exam.ujian.durasi,
          jam_selesai: calculateWaktuSelesai(exam.ujian.durasi),
        },
        { where: { id: exam.id } }
      );
      return {
        msg: "Selamat melakukan Ujian",
        waktu_tersisa: Number(exam.ujian.durasi) * 60,
        status_ujian: "progress",
        jawaban: JSON.stringify([]),
        soal: JSON.stringify(soal),
        jam_mulai: formatIndonesia(currentTime),
      };
    }

    if (exam.status === "progress") {
      const currentTime = moment().tz("Asia/Jakarta").toDate();
      const waktuTersisa = calculateMinutesDifference(
        currentTime,
        exam.jam_selesai
      );

      if (!exam.jam_mulai) {
        await nilaiPPdbController.update(
          {
            waktu_tersisa: waktuTersisa,
            jam_mulai: currentTime,
          },
          {
            where: {
              id: exam.id,
            },
          }
        );
      } else {
        await nilaiPPdbController.update(
          {
            waktu_tersisa: waktuTersisa,
          },
          {
            where: {
              id: exam.id,
            },
          }
        );
      }

      return {
        msg: "Selamat melanjutkan Ujian",
        waktu_tersisa: waktuTersisa * 60,
        jam_mulai: formatIndonesia(exam.jam_mulai),
        status_ujian: exam.status,
        soal: JSON.stringify(soal),
      };
    }
  } else {
    // if (now < startTime) {
    //   return {
    //     statusCode: 422,
    //     msg: "Waktu Ujian belum dimulai",
    //   };
    // }
    console.log("waktu selesai", calculateMinutesDifference(now, endTime) * 60);
  }

  // return {
  //   msg: "Ujian dimulai",
  //   soal: soal,
  //   status_ujian: "progress",
  //   jawaban: JSON.stringify([]),
  //   soal: JSON.stringify(soal),
  //   // waktu_tersisa: calculateMinutesDifference(now, endTime) * 60,
  // };
});

const submitExamPpdb = response.requestResponse(async (req, res) => {
  const { data: jawaban } = req.body;
  const exam = await nilaiPPdbController.findOne({
    where: {
      user_id: req.id,
    },
    include: [
      {
        model: models.ujian,
        attributes: ["id", "soal", "waktu_selesai"],
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
      jam_selesai: moment().tz("Asia/Jakarta").toDate(),
      waktu_selesai: exam.ujian.waktu_selesai,
      exam_result: nilai,
      jam_submit: moment().tz("Asia/Jakarta").toDate(),
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
    jam_selesai: formatIndonesia(new Date()),
  };
});

const progressExamPpdb = response.requestResponse(async (req, res) => {
  const jawaban = req.body.data;
  const exam = await nilaiPPdbController.findOne({
    where: {
      user_id: req.id,
    },
    include: [
      {
        model: models.ujian,
        attributes: ["id", "soal", "status"],
      },
    ],
  });
  console.log("exam status", exam.status);
  console.log("user_id:", req.id);

  if (exam.status === "open") {
    return {
      statusCode: 422,
      msg: "Ujian belum dimulai",
    };
  }
  if (exam.status === "finish") {
    return {
      statusCode: 422,
      msg: "Ujian telah selesai",
    };
  }
  const timeRemaining = calculateMinutesDifference(
    moment().tz("Asia/Jakarta").toDate(),
    exam.jam_selesai
  );
  if (timeRemaining <= 0 && timeRemaining > -1000) {
    await nilaiPPdbController.update(
      {
        status: "finish",
        jawaban: JSON.stringify(jawaban),
      },
      {
        where: {
          id: exam.id,
        },
      }
    );
    return {
      statusCode: 422,
      msg: "Waktu ujian telah habis",
    };
  }

  await nilaiPPdbController.update(
    {
      jam_progress: new Date(),
      jawaban: JSON.stringify(jawaban),
    },
    {
      where: {
        id: exam.id,
      },
    }
  );

  return {
    statusCode: 200,
    msg: "Progress ujian berhasil tersimpan",
    jam_progress: formatIndonesia(exam.jam_progress),
  };
});

module.exports = {
  getExamPpdb,
  takeExamPpdb,
  submitExamPpdb,
  progressExamPpdb,
};

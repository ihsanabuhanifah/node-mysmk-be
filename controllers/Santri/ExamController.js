const studentModel = require("../../models").student;

const models = require("../../models");
const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");
const {
  calculateMinutesDifference,
  calculateWaktuSelesai,
} = require("../../utils/format");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;

const response = new RESPONSE_API();

const getExam = response.requestResponse(async (req, res) => {
  const { page, pageSize } = req.query;
  const exam = await NilaiController.findAndCountAll({
    ...(pageSize !== undefined && { limit: pageSize }),
    ...(page !== undefined && { offset: page }),
    where: {
      student_id: req.student_id,
    },
    attributes : {
      exclude : 'jawaban'
    },
    include: [
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
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
          "durasi"
        ],
        include: [
          {
            model: models.mapel,
            require: true,
            as: "mapel",
            attributes: ["id", "nama_mapel"],
          },
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

const takeExam = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const exam = await NilaiController.findOne({
    where: {
      id: id,
      student_id: req.student_id,
    },
    include: [
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
      msg: "Ujian telah berakhir",
    };
  }

  if (exam.refresh_count <= 0 && exam.status === "progress") {
    return {
      statusCode: 422,
      msg: "Anda tidak dapat mengambil ujian ini , Silahkan  menghubungi pengawas",
    };
  }

  if (exam.waktu_tersisa <= 0 && exam.status === "progress") {
    await NilaiController.update(
      {
        status: "finish",
      },
      {
        where: {
          id: exam.id,
        },
      }
    );
    return {
      statusCode: 422,
      msg: "Waktu Telah habis, Ujian berakhir",
    };
  }

  const now = new Date();
  const startTime = new Date(exam.ujian.waktu_mulai);
  const endTime = new Date(exam.ujian.waktu_selesai);

  if (
    (now >= startTime && now <= endTime) ||
    exam.ujian.tipe_ujian === "open" ||
    exam.status === "progress" ||
    exam.remidial_count === 1
  ) {
    soal = soal.map((item) => {
      return {
        id: item.id,
        soal: item.soal,
        tipe: item.tipe,
        point: item.point,
      };
    });

    if (exam.status === "open") {
      await NilaiController.update(
        {
          refresh_count: 3,
          status: "progress",
          jam_mulai: new Date(),
          remidial_count: 0,
          jawaban : JSON.stringify([]),
          waktu_tersisa: exam.ujian.durasi,
          jam_selesai: calculateWaktuSelesai(exam.ujian.durasi),
        },
        {
          where: {
            id: exam.id,
          },
        }
      );
      return {
        msg: "Selamat melakukan Ujian",
        waktu_tersisa: exam.ujian.durasi,
        refresh_count: 3,
        status_ujian: "progress",
        jawaban: JSON.stringify([]),
        soal: JSON.stringify(soal),
      };
    }

    if (exam.status === "progress") {
      await NilaiController.update(
        {
          refresh_count: exam.refresh_count - 1,
          waktu_tersisa: calculateMinutesDifference(
            new Date(),
            exam.jam_selesai
          ),
        },
        {
          where: {
            id: exam.id,
          },
        }
      );
      return {
        msg: "Selamat melanjutkan Ujian",
        waktu_tersisa: calculateMinutesDifference(new Date(), exam.jam_selesai),
        jam_mulai: exam.jam_mulai,
        jam_selesai: exam.jam_selesai,
        refresh_count: exam.refresh_count - 1,
        status_ujian: exam.status,
        jawaban: exam.jawaban,
        soal: JSON.stringify(soal),
      };
    }
  } else {
    if (now < startTime) {
      return {
        status: 422,
        msg: "Waktu Ujian belum dimulai",
      };
    } else {
      return {
        status: 422,
        msg: "Waktu Ujian sudah terlewat",
      };
    }
  }
});

const submitExam = response.requestResponse(async (req, res) => {
  const jawaban = req.body.data;
  const id = req.body.id;


  const exam = await NilaiController.findOne({
    where: {
      id: id,
      student_id: req.student_id,
    },
    include: [
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
          "soal",
          "durasi",
        ],
      },
    ],
  });

  if (!exam) {
    return {
      statusCode: 422,
      msg: "Ujian tidak ditemukan",
    };
  }

  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.ujian.soal),
      },
    },
  });

  if (exam.status === "finish") {
    return {
      statusCode: 422,
      msg: "Ujian telah berakhir",
    };
  }

  if (exam.status === "open") {
    return {
      statusCode: 422,
      msg: "Ujian belum dimulai",
    };
  }

  soal = soal.map((item) => {
    return {
      id: item.id,
      soal: item.soal,
      tipe: item.tipe,
      jawaban: item.jawaban,
      point: item.point,
    };
  });

  let total_point = 0;
  let point_siswa = 0;
  let keterangan = "";
  let nilai = 0;
  await soal.map((item) => {
    total_point = total_point + item.point;
    if (item.tipe !== "ES") {
      jawaban?.map((jawab) => {
        if (jawab.id === item.id && item.tipe !== "ES") {
          if (jawab.jawaban === item.jawaban) {
            point_siswa = point_siswa + item.point;
          }
        }
      });
    } else {
      keterangan = "essay belum diberikan point";
    }
  });

  nilai = (point_siswa / total_point) * 100;

  let exam_result = [];
  if (!!exam.exam === true) {
    exam_result = JSON.parse(exam.exam);
    exam_result = [...exam_result, nilai];
  } else {
    exam_result = [nilai];
  }

  if (!!exam.exam1 === false) {
    await NilaiController.update(
      {
        jam_submit: new Date(),
        keterangan: keterangan,
        exam: JSON.stringify(exam_result),
        status: "finish",
        
        remidial_count: 0,
        jawaban: JSON.stringify(jawaban),
      },
      {
        where: {
          id: id,
        },
      }
    );

    return {
      msg: "Jawaban berhasil tersimpan",
      nilai: nilai,
      
      keterangan: keterangan,
      total_point,
      point_siswa,
    };
  }
});

const progressExam = response.requestResponse(async (req, res) => {
  const jawaban = req.body.data;
  const id = req.body.id;

  const exam = await NilaiController.findOne({
    where: {
      id: id,
      student_id: req.student_id,
    },
  });

  if (exam.status === "open") {
    return {
      statusCode: 422,
      msg: "Ujian belum dimulai",
    };
  }

  if (
    calculateMinutesDifference(new Date(), exam.jam_selesai) < -1 ||
    exam.status === "finish"
  ) {
    return {
      msg: "Waktu Ujian telah berakhir",
      statusCode: 422,
    };
  }

  await NilaiController.update(
    {
      jam_progress: new Date(),
      jawaban: JSON.stringify(jawaban),
    },
    {
      where: {
        id: id,
      },
    }
  );

  return {
    msg: "Progress Ujian tersimpan",
  };
});

module.exports = { getExam, takeExam, submitExam, progressExam };

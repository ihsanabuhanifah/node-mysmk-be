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
  const { page, pageSize } = req.query;
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
  });

  if (!exam) {
    return {
      status: 442,
      msg: "Ujian tidak ditemukan",
    };
  }

  if (exam.status === "finish") {
    return {
      status: 442,
      msg: "Ujian telah berakhir",
    };
  }

  if (exam.refresh_count <= 0 && exam.status === "progress") {
    return {
      status: 442,
      msg: "Anda tidak dapat mengambil ujian ini , Silahkan  menghubungi pengawas",
    };
  }

  const now = new Date();
  const startTime = new Date(exam.ujian.waktu_mulai);
  const endTime = new Date(exam.ujian.waktu_selesai);

  if (
    (now >= startTime && now <= endTime) ||
    exam.ujian.tipe_ujian === "open" ||
    exam.status === "progress"
  ) {
    if (exam.status === "open") {
      await NilaiController.update(
        {
          refresh_count: 3,
          status: "progress",
          jam_mulai: new Date(),
          jam_selesai: calculateWaktuSelesai(exam.waktu_tersisa),
        },
        {
          where: {
            id: exam.id,
          },
        }
      );
      return {
        msg: "Selamat melakukan Ujian",
        waktu_tersisa: exam.waktu_tersisa,
        refresh_count: 3,
        data: exam,
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
        data: exam,
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

module.exports = { getExam, takeExam };

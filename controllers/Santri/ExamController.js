const studentModel = require("../../models").student;

const models = require("../../models");
const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");
const { calculateMinutesDifference } = require("../../utils/format");
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

  if (exam.status === "finish") {
    return {
      msg: "Ujian telah berakhir",
    };
  }

  const now = new Date();
  const startTime = new Date(exam.ujian.waktu_mulai);
  const endTime = new Date(exam.ujian.waktu_selesai);

  if (now >= startTime && now <= endTime) {
    if (exam.status === "open") {
      await NilaiController.update(
        {
          status: "progress",
          jam_mulai: new Date(),
          waktu_tersisa: calculateMinutesDifference(
            exam.ujian.waktu_mulai,
            exam.ujian.waktu_selesai
          ),
        },
        {
          where: {
            id: exam.id,
          },
        }
      );
      return {
        msg: "Selamat melakukan Ujian",
        waktu_tersisa: calculateMinutesDifference(
          exam.ujian.waktu_mulai,
          exam.ujian.waktu_selesai
        ),
        data: exam,
      };
    }

    if (exam.status === "progress") {
      return {
        msg: "Selamat melanjutkan Ujian",
        waktu_tersisa: calculateMinutesDifference(
          exam.jam_mulai,
          exam.ujian.waktu_selesai
        ),
        data: exam,
      };
    }
  } else {
    if (now < startTime) {
      return {
        msg: "Waktu Ujian belum dimulai",
      };
    } else {
      return {
        msg: "Waktu Ujian sudah terlewat",
      };
    }
  }
});

module.exports = { getExam, takeExam };

const studentModel = require("../../models").student;
const Sequelize = require("sequelize");
const models = require("../../models");
const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");

const {
  calculateMinutesDifference,
  calculateWaktuSelesai,
  checkQuery,
} = require("../../utils/format");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const HasilBelajarController = require("../../models").hasil_belajar;
const StudentModel = require("../../models").kelas_student;

const response = new RESPONSE_API();

const listRaport = response.requestResponse(async (req, res) => {
  let { nama_kelas, nama_guru, tahun_ajaran, page, pageSize, nama_mapel } =
    req.query;
  const nilai = await HasilBelajarController.findAll({
    where: {
      student_id: req.StudentId,
    },

    include: [
      {
        model: models.mapel,
        require: true,
        as: "mapel",
        attributes: ["id", "nama_mapel"],
        where: {
          ...(checkQuery(nama_mapel) && {
            nama_mapel: {
              [Op.substring]: nama_mapel,
            },
          }),
        },
      },
      {
        model: models.ta,
        require: true,
        as: "tahun_ajaran",
        attributes: ["id", "nama_tahun_ajaran"],

        where: {
          ...(checkQuery(tahun_ajaran) && {
            nama_tahun_ajaran: {
              [Op.substring]: tahun_ajaran,
            },
          }),
        },
      },

      {
        model: models.kelas,
        require: true,
        as: "kelas",
        attributes: ["id", "nama_kelas"],
        where: {
          ...(checkQuery(nama_kelas) && {
            nama_kelas: {
              [Op.substring]: nama_kelas,
            },
          }),
        },
      },
    ],
  });

  return {
    nilai,
    msg: "Raport berhasil ditemukan",
  };
});

const listRaportDetail = response.requestResponse(async (req, res) => {
  let { ta_id, teacher_id, mapel_id, kelas_id } = req.params;
  const nilai = await NilaiController.findAll({
    where: {
      student_id: req.StudentId,
      ta_id: ta_id,
      mapel_id: mapel_id,
      kelas_id: kelas_id,
    },
    attributes: {
      exclude: "jawaban",
    },

    include: [
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
      },
      {
        model: models.mapel,
        require: true,
        as: "mapel",
        attributes: ["id", "nama_mapel"],
      },
      {
        model: models.ta,
        require: true,
        as: "tahun_ajaran",
        attributes: ["id", "nama_tahun_ajaran"],
      },

      {
        model: models.kelas,
        require: true,
        as: "kelas",
        attributes: ["id", "nama_kelas"],
      },
    ],
  });

  return {
    nilai,
    msg: "Detail Mata Pelaharan berhasil ditemukan",
  };
});

const listExam = response.requestResponse(async (req, res) => {
  let { nama_kelas, nama_guru, tahun_ajaran, page, pageSize, nama_mapel } =
    req.query;
  const { rows, count } = await NilaiController.findAndCountAll({
    where: {
      student_id: req.StudentId,
    },
    limit: pageSize,
    offset: page,

    attributes: {
      exclude: "jawaban",
    },
    include: [
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
        where: {
          ...(checkQuery(nama_guru) && {
            nama_guru: {
              [Op.substring]: nama_guru,
            },
          }),
        },
      },
      {
        model: models.mapel,
        require: true,
        as: "mapel",
        attributes: ["id", "nama_mapel"],
        where: {
          ...(checkQuery(nama_mapel) && {
            nama_mapel: {
              [Op.substring]: nama_mapel,
            },
          }),
        },
      },
      {
        model: models.ta,
        require: true,
        as: "tahun_ajaran",
        attributes: ["id", "nama_tahun_ajaran"],

        where: {
          ...(checkQuery(tahun_ajaran) && {
            nama_tahun_ajaran: {
              [Op.substring]: tahun_ajaran,
            },
          }),
        },
      },

      {
        model: models.kelas,
        require: true,
        as: "kelas",
        attributes: ["id", "nama_kelas"],
        where: {
          ...(checkQuery(nama_kelas) && {
            nama_kelas: {
              [Op.substring]: nama_kelas,
            },
          }),
        },
      },
    ],
  });

  return {
    data: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      pageSize: pageSize,
    },
    msg: "Raport berhasil ditemukan",
  };
});

module.exports = { listRaport, listRaportDetail, listExam };

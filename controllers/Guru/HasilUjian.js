const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");

const nilaiModel = require("../../models").nilai;
const mapelModel = require("../../models").mapel;
const kelasModel = require("../../models").kelas;
const tahunAjaranModel = require("../../models").ta;
const ujianModel = require("../../models").ujian;
const teacherModel = require("../../models").teacher;

const listHasilUjain = async (req, res) => {
  let {
    page,
    pageSize,
    nama_mapel,
    judul_ujian,
    jenis_ujian,
    kelas,
    th_ajaran,
  } = req.query;

  const { rows, count } = await nilaiModel.findAndCountAll({
    where: {
      status: "finish",
      student_id: req.params.id,
      ...(checkQuery(jenis_ujian) && {
        jenis_ujian: {
          [Op.substring]: jenis_ujian,
        },
      }),
    },
    limit: pageSize,
    offset: page,
    include: [
      {
        model: teacherModel,
        as: "teacher",
      },
      {
        model: mapelModel,
        as: "mapel",
        attributes: {
          exclude: "mapel_id",
          include: ["id"],
        },
        where: {
          ...(checkQuery(nama_mapel) && {
            nama_mapel: {
              [Op.substring]: nama_mapel,
            },
          }),
        },
      },
      {
        model: kelasModel,
        as: "kelas",
        where: {
          ...(checkQuery(kelas) && {
            nama_kelas: {
              [Op.like]: `${kelas} %`,
            },
          }),
        },
      },
      {
        model: tahunAjaranModel,
        as: "tahun_ajaran",
        where: {
          ...(checkQuery(th_ajaran) && {
            nama_tahun_ajaran: {
              [Op.substring]: th_ajaran,
            },
          }),
        },
      },
    //   {
    //     model: ujianModel,
    //     as: "ujian",
    //     atrributes: {
    //       include: ["judul_ujian"],
    //     },
    //     where: {
    //       ...(checkQuery(judul_ujian) && {
    //         judul_ujian: {
    //           [Op.substring]: judul_ujian,
    //         },
    //       }),
    //     },
    //   },
    ],
  });

  return res.json({
    status: "Success",
    data: rows,
    page: page,
    pageSize: pageSize,
    totalPage: Math.ceil(count / pageSize),
    count: count,
  });
};

module.exports = { listHasilUjain };

const TugasPklModel = require("../../models").tugas_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");
const dayjs = require("dayjs");
const TeacherModel = require("../../models").teacher;
const StudentModel = require("../../models").student;
const TempatPklModel = require("../../models").tempat_pkl;

const tugasPklList = response.requestResponse(async (req, res) => {
  const tempatPklRecord = await TempatPklModel.findOne({
    where: {
      student_id: req.student_id, 
    },
    attributes: ["pembimbing_id"],
  });
  const pembimbingId = tempatPklRecord.pembimbing_id;
  console.log('_-------------------->', pembimbingId)
  const { page, pageSize, dariTanggal, sampaiTanggal } = req.query;
  const { count, rows } = await TugasPklModel.findAndCountAll({
    where: {
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
      teacher_id: pembimbingId,
    },
    include : [
      {
        require: true,
        as: "teacher",
        model: TeacherModel,
      },
    ],

    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
  });
  console.log("-------->", rows)
  return {
    message: "Berhasil",
    data: rows,
    page: req.page,
    pageSize: pageSize,
    pagination: {
      page: req.page,
      pageSize: pageSize,
      total: count,
    },
  };
});
const getTugasPklById = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const tugasPkl = await TugasPklModel.findOne({
    where: {
      id: id,
    },
    include: [
      {
        require: true,
        as: "teacher",
        model: TeacherModel,
        attributes: ["id", "nama_guru"],
      },
    ],
  });
  if (!tugasPkl) {
    return {
      statusCode: 404,
      status: "error",
      message: "Tugas tidak ditemukan",
    };
  }
  return {
    statusCode: 200,
    status: "success",
    message: "Data Tugas Ditemukan",
    data: tugasPkl,
  };
});

module.exports = {
  tugasPklList,
  getTugasPklById,
};

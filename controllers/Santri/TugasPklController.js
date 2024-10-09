const TugasPklModel = require("../../models").tugas_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");
const dayjs = require("dayjs");
const TeacherModel = require("../../models").teacher;
const StudentModel = require("../../models").student;

const tugasPklList = response.requestResponse(async (req, res) => {
  const { page, pageSize, dariTanggal, sampaiTanggal } = req.query;
  const { count, rows } = await TugasPklModel.findAndCountAll({
    where: {
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
    },
    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
  });
  return {
    message: "Berhasil",
    data: rows,
    page: req.page,
    pageSize: pageSize,
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

const TugasPklModel = require("../../models").tugas_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");
const dayjs = require("dayjs");
const TeacherModel = require("../../models").teacher;
const StudentModel = require("../../models").student;
const JawabanTugasPklModel = require("../../models").jawaban_tugas_pkl;

const createTugasPkl = response.requestResponse(async (req, res) => {
  console.log("jalan");
  let payload = req.body;
  const tugasPklPayload = await TugasPklModel.create({
    ...payload,
    tanggal: dayjs(new Date()).format("YYYY-MM-DD"),
    teacher_id: req.teacher_id,
  });
  return {
    statusCode: 201,
    status: "success",
    message: "Data Berhasil Dibuat",
    data: tugasPklPayload,
  };
});

const tugasPklList = response.requestResponse(async (req, res) => {
  const { page, pageSize, dariTanggal, sampaiTanggal, nama_siswa } = req.query;
  
  const { count, rows } = await TugasPklModel.findAndCountAll({
    where: {
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
    },
    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
    include: [
      // {
      //   require: true,
      //   as: "siswa",
      //   model: StudentModel,
      //   attributes: ["id", "nama_siswa"],
      //   where: {
      //     ...(checkQuery(nama_siswa) && {
      //       nama_siswa: {
      //         [Op.substring]: nama_siswa,
      //       },
      //     }),
      //   },
      // },
    ],
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
const updateTugasPkl = response.requestResponse(async (req, res) => {
  const payload = req.body;
  const { id } = req.params;
  const updated = await TugasPklModel.update(payload, {
    where: { id: id },
  });
  if (updated[0] === 0) {
    return {
      statusCode: 404,
      status: "error",
      message: "Tugas tidak ditemukan",
    };
  }
  return {
    statusCode: 200,
    status: "success",
    message: "Data Tugas Berhasil Diupdate",
  };
});
const deleteTugasPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const deleted = await TugasPklModel.destroy({ where: { id: id } });
  if (deleted === 0) {
    return {
      statusCode: 404,
      status: "error",
      message: "Tugas tidak ditemukan",
    };
  }
  return {
    statusCode: 200,
    status: "success",
    message: "Data Tugas Berhasil Dihapus",
  };
});



module.exports = {
  createTugasPkl,
  tugasPklList,
  updateTugasPkl,
  getTugasPklById,
  deleteTugasPkl,
};

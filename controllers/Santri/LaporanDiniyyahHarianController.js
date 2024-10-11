const LaporanDiniyyahModel = require("../../models").laporan_diniyyah_harian;
const { RESPONSE_API } = require("../../utils/response");
const StudentModel = require("../../models").student;
const { checkQuery } = require("../../utils/format");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const response = new RESPONSE_API();

const createLaporanDiniyyah = response.requestResponse(async (req, res) => {
  let today = dayjs(new Date()).format("YYYY-MM-DD");

  let payload = req.body;
  const existingLaporan = await LaporanDiniyyahModel.findOne({
    where: {
      student_id: req.student_id,
      tanggal: today,
    },
  });
  if (existingLaporan) {
    return {
      statusCode: 400,
      status: "fail",
      message: "Anda hanya dapat membuat satu laporan diniyyah per hari.",
    };
  }
  const laporanDiniyyahHarian = await LaporanDiniyyahModel.create({
    ...payload,
    student_id: req.student_id,
    tanggal: today,
  });
  return {
    statusCode: 201,
    status: "success",
    message: "Data Berhasil Diupload",
    data: laporanDiniyyahHarian,
  };
});
const laporanDiniyyahList = response.requestResponse(async (req, res) => {
  const { page, pageSize, dariTanggal, sampaiTanggal } = req.query;
  const { count, rows } = await LaporanDiniyyahModel.findAndCountAll({
    where: {
      student_id: req.student_id,
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
    },
    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
      },
    ],
  });

  return {
    message: "Berhasil",
    data: rows,
    page: req.page,
    pageSize: pageSize,
  };
});

const updateLaporanDiniyyah = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  let payload = req.body;
  const laporanDiniyyah = await LaporanDiniyyahModel.findOne({
    where: {
      id: id,
    },
  });
  if (laporanDiniyyah === null) {
    return res.status(422).json({
      status: "Fail",
      msg: `Laporan Pkl dengan id ${id} tidak dapat Ditemukan`,
    });
  }

  await LaporanDiniyyahModel.update(payload, {
    where: {
      id: id,
    },
  });
  return {
    statusCode: 201,
    message: `Data dengan id ${id} Berhasil Di Update`,
    data: req.body,
  };
});
const getDetailByPklId = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const laporanDiniyyah = await LaporanDiniyyahModel.findOne({
    where: {
      laporan_harian_pkl_id: id,
    },
  });
  if (laporanDiniyyah === null) {
    return {
      status: "Fail",
      msg: `Laporan Pkl dengan id ${id} tidak dapat Ditemukan`,
      data: null,
    };
  }
  return {
    message: `Berhasil Menemukan data dengan id ${id}`,
    data: laporanDiniyyah,
  };
});
module.exports = {
  createLaporanDiniyyah,
  laporanDiniyyahList,
  updateLaporanDiniyyah,
  getDetailByPklId,
};
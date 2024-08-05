const LaporanDiniyyahModel = require("../../models").laporan_diniyyah_harian;
const { RESPONSE_API } = require("../../utils/response");
const StudentModel = require("../../models").student;
const { checkQuery } = require("../../utils/format");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const response = new RESPONSE_API();

const createLaporanDiniyyah = async (
  req,
  res,
  laporanPklId,
  student_idParams
) => {
  let payload = req.body.laporanDiniyyah;
  const laporanDiniyyahHarian = await LaporanDiniyyahModel.create({
    ...payload,
    student_id: student_idParams,
    tanggal: dayjs(new Date()).format("YYYY-MM-DD"),
    laporan_harian_pkl_id: laporanPklId,
  });
  return {
    statusCode: 201,
    status: "success",
    message: "Data Berhasil Diupload",
    data: laporanDiniyyahHarian,
  };
};
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
module.exports = {
  createLaporanDiniyyah,
  laporanDiniyyahList,
  updateLaporanDiniyyah,
};

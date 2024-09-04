const LaporanHarianPklModel = require("../../models").laporan_harian_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const StudentModel = require("../../models").student;
const laporanDiniyyahModel = require("../../models").laporan_diniyyah_harian;
const { checkQuery } = require("../../utils/format");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const { createLaporanDiniyyah } = require("./LaporanDiniyyahHarianController");
const createLaporanPkl = response.requestResponse(async (req, res) => {
  let { laporanDiniyyah, ...payload } = req.body;
  const laporanHarianPkl = await LaporanHarianPklModel.create({
    ...payload,
    student_id: req.student_id,
    tanggal: dayjs(new Date()).format("YYYY-MM-DD"),
    is_absen: true,
  });

  const laporanDiniyyahResult = await createLaporanDiniyyah(
    req,
    res,
    laporanHarianPkl.id,
    req.student_id
  );

  return {
    statusCode: 201,
    status: "success",
    message: "Data Berhasil Diupload",
    data: {
      laporanHarianPkl,
      laporanDiniyyah: laporanDiniyyahResult,
    },
  };
});
const updateLaporanPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  let payload = req.body;
  const laporanPkl = await LaporanHarianPklModel.findOne({
    where: {
      id: id,
    },
  });
  if (laporanPkl === null) {
    return res.status(422).json({
      status: "Fail",
      msg: `Laporan Pkl dengan id ${id} tidak dapat Ditemukan`,
    });
  }
  await LaporanHarianPklModel.update(payload, {
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

const laporanPklList = response.requestResponse(async (req, res) => {
  const { page, pageSize, dariTanggal, sampaiTanggal, status_kehadiran } =
    req.query;
  const { count, rows } = await LaporanHarianPklModel.findAndCountAll({
    where: {
      student_id: req.student_id,
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
      ...(checkQuery(status_kehadiran) && {
        status : status_kehadiran
      })
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
      {
        require: true,
        as: "laporan_diniyyah_harian",
        model: laporanDiniyyahModel,
      },
    ],
  });

  return {
    message: "Berhasil",
    data: rows,

    pagination: {
      page: req.page,
      pageSize: pageSize,
      total: count,
    },
  };
});

const detailLaporanPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const laporanPkl = await LaporanHarianPklModel.findOne({
    where: {
      id: id,
    },
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["id", "nama_siswa"],
      },
      {
        require: true,
        as: "laporan_diniyyah_harian",
        model: laporanDiniyyahModel,
      },
    ],
  });
  return {
    message: `Berhasil menemukan data dengan id ${id}`,
    data: laporanPkl,
  };
});

module.exports = {
  createLaporanPkl,
  updateLaporanPkl,
  laporanPklList,
  detailLaporanPkl,
};

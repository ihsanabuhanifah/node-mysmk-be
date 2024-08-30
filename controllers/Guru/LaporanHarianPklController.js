const LaporanHarianPklModel = require("../../models").laporan_harian_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");
const StudentModel = require("../../models").student;

const laporanPklList = response.requestResponse(async (req, res) => {
  const {
    page,
    pageSize,
    dariTanggal,
    sampaiTanggal,
    nama_siswa,
    status_kehadiran,
  } = req.query;
  const { count, rows } = await LaporanHarianPklModel.findAndCountAll({
    where: {
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
      status: status_kehadiran,
    },
    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["id", "nama_siswa"],
        where: {
          ...(checkQuery(nama_siswa) && {
            nama_siswa: {
              [Op.substring]: nama_siswa,
            },
          }),
        },
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
          attributes : ['id', 'nama_siswa']
        },
      ],
    });
    return {
      message: `Berhasil menemukan data dengan id ${id}`,
      data: laporanPkl,
    };
  });

module.exports = {
  laporanPklList,
  detailLaporanPkl,
  laporanPklListForPembimbing
};

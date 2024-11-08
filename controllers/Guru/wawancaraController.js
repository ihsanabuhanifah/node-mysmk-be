const WawancaraModel = require("../../models").wawancara;
const models = require("../../models");
const info_calsan = require("../../models").informasi_calon_santri;

const listWawancara = async (req, res) => {
  const { page, pageSize } = req.query;
  try {
    const wawancaraList = await WawancaraModel.findAndCountAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      include: [
        {
          model: models.teacher,
          required: true,
          as: "guruWawancara",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.informasi_calon_santri,
          required: true,
          attributes: ["id", "nama_siswa"],
        },
      ],
      order: [["id", "ASC"]],
    });

    if (wawancaraList.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Tidak ada data wawancara ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: wawancaraList,
      offset: page,
      limit: pageSize,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Terjadi kesalahan saat mengambil daftar wawancara",
      error: error.message,
    });
  }
};
module.exports = {
  listWawancara,
};

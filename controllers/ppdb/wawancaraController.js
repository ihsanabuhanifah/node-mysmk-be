const WawancaraModel = require("../../models").wawancara;
const models = require("../../models");

const createWawancara = async (req, res) => {
  const {
    method,
    tanggal,
    status_tes,
    catatan,
    is_lulus,
    is_batal,
    pewawancara,
  } = req.body;
  const user_id = req.id;
  try {
    const newWawancara = await WawancaraModel.create({
      user_id,
      method,
      tanggal,
      status_tes,
      catatan,
      is_lulus,
      is_batal,
      pewawancara,
    });

    return res.status(201).json({
      status: "success",
      message: "Wawancara berhasil dibuat",
      data: newWawancara,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Terjadi kesalahan saat membuat wawancara",
      error: error.message,
    });
  }
};

const detailWawancara = async (req, res) => {
  try {
    const user_id = req.id;
    const wawancaraDetail = await WawancaraModel.findOne({
      where: { user_id },
      include: [
        {
          model: models.teacher,
          required: true,
          as: "guruWawancara",
          attributes: ["id", "nama_guru"],
        },
      ],
    });

    if (!wawancaraDetail) {
      return res.status(404).json({
        status: "fail",
        message: "Wawancara tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      data: wawancaraDetail,
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Terjadi kesalahan saat mengambil detail wawancara",
      error: error.message,
    });
  }
};

module.exports = {
  createWawancara,
  detailWawancara,
};

const models = require("../../models");
const nilaiModel = require("../../models").nilai_ppdb;

const listNilai = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  try {
    const list = await nilaiModel.findAndCountAll({
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      include: [
        {
          model: models.user,
          required: true,
          attributes: ["id", "name"],
        },
        {
          model: models.ujian,
          required: true,
          attributes: ["id", "judul_ujian"],
        },
      ],
      order: [["id", "ASC"]],
    });

    // Check if data exists
    if (list.count === 0) {
      return res.status(200).json({
        status: "Success",
        msg: "Tidak ditemukan nilai",
        data: [],
        offset: page,
        limit: pageSize,
      });
    }

    const totalPages = Math.ceil(list.count / parseInt(pageSize));

    return res.status(200).json({
      status: "Success",
      msg: "Berhasil menemukan nilai",
      data: list.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: list.count,
        limit: pageSize,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Error",
      msg: "Terjadi kesalahan saat mengambil data nilai",
      error: error.message,
    });
  }
};

module.exports = {
  listNilai,
};

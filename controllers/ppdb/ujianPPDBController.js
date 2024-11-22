const ujianModel = require("../../models").ujian;

const listUjian = async (req, res) => {
  try {
    const idUjian = process.env.ID_UJIAN_PPDB;

    if (!idUjian) {
      return res.status(400).json({
        success: false,
        message: "ID_UJIAN tidak ditemukan di environment variables",
      });
    }

    const ujian = await ujianModel.findAll({
      where: {
        id: idUjian,
      },
    });

    if (!ujian.length) {
      return res.status(404).json({
        success: false,
        message: "Ujian tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: ujian,
    });
  } catch (error) {
    console.error("Error fetching ujian:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data ujian",
    });
  }
};
module.exports = {
  listUjian,
};

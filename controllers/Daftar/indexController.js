const MapelModel = require("../../models").mapel;

const listMapel = async (req, res) => {
  try {
    const mapel = await MapelModel.findAll({
      attributes: ["id", "nama_mapel", "kategori"],
    });

    return res.json({
      status: "Success",
      totalMapel : mapel.length,
      msg: "Mata Pelajaran ditemukan",

      data: mapel,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

module.exports = { listMapel };

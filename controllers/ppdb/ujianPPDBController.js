const MapelModel = require("../../models").mapel;

const listMapel = async (req, res) => {
  try {
    const mapel = await MapelModel.findAll({
      attributes: ["id", "nama_mapel", "kategori"],
      where : {
        is_active : 1,
        nama_mapel: 'Ujian PPDB'
      }
    });

    return res.json({
      status: "Success",
      totalMapel: mapel.length,

      data: mapel,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
module.exports = {
  listMapel,
};

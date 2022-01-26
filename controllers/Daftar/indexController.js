const MapelModel = require("../../models").mapel;
const KelasModel = require("../../models").kelas;
const KelasSiswaModel = require("../../models").kelas_student;
const TahunAjaranModel = require("../../models").ta;
const listMapel = async (req, res) => {
  try {
    const mapel = await MapelModel.findAll({
      attributes: ["id", "nama_mapel", "kategori"],
    });

    return res.json({
      status: "Success",
      totalMapel: mapel.length,
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

const listKelas = async (req, res) => {
  try {
    const kelas = await KelasModel.findAll();

    return res.json({
      status: "Success",
      totalMapel: kelas.length,
      msg: "Mata Pelajaran ditemukan",

      data: kelas,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const listKelasSiswa = async (req, res) => {
  try {
    const kelas = await KelasModel.findAll();

    return res.json({
      status: "Success",
      totalMapel: kelas.length,
      msg: "Mata Pelajaran ditemukan",

      data: kelas,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const listTahunAjaran = async (req, res) => {
  try {
    const tahun_ajaran = await TahunAjaranModel.findAll();

    return res.json({
      status: "Success",
      totalMapel: tahun_ajaran.length,
      msg: "Mata Pelajaran ditemukan",

      data: tahun_ajaran,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};


module.exports = { listMapel, listKelas,listKelasSiswa, listTahunAjaran };

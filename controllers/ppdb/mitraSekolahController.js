const mitraSekolah = require("../../models").mitra_sekolah;
const uploadFoto = require("../../utils/multer");
const cloudinary = require("../../config/cloudinary");
const fs = require("fs");
const createMitraSekolah = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        status: "fail",
        message: "No file uploaded",
      });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "/ppdb",
    });
    const newMitraSekolah = await mitraSekolah.create({
      img_url: result.secure_url,
    });
    res.send({
      status: "success",
      img_url: newMitraSekolah,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const getMitraSekolah = async (req, res) => {
  try {
    const mitraSekolahList = await mitraSekolah.findAll();
    res.status(200).send({
      status: "success",
      data: mitraSekolahList,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const getMitraSekolahById = async (req, res) => {
  try {
    const { id } = req.params;
    const mitraSekolahItem = await mitraSekolah.findByPk(id);
    if (!mitraSekolahItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }
    res.status(200).send({
      status: "success",
      data: mitraSekolahItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const updateMitraSekolah = async (req, res) => {
  try {
    const { id } = req.params;
    const { imgUrl } = req.body;

    const mitraSekolahItem = await mitraSekolah.findByPk(id);
    if (!mitraSekolahItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }
    await mitraSekolahItem.update({ imgUrl });
    res.status(200).send({
      status: "success",
      data: mitraSekolahItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const deleteMitraSekolah = async (req, res) => {
  try {
    const { id } = req.params;

    const mitraSekolahItem = await mitraSekolah.findByPk(id);
    if (!mitraSekolahItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }

    await mitraSekolahItem.destroy();
    res.status(200).send({
      status: "success",
      message: "Data berhasil dihapus",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};


module.exports = {
  createMitraSekolah,
  getMitraSekolahById,
  getMitraSekolah,
  updateMitraSekolah,
  deleteMitraSekolah
};

const galleryKegiatan = require("../../models").gallery_kegiatan;
const cloudinary = require("../../config/cloudinary");
const fs = require("fs");

const createGalleryKegiatan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        status: "fail",
        message: "No file uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "/ppdb/galleryKegiatan",
    });

    const newGalleryKegiatan = await galleryKegiatan.create({
      img_url: result.secure_url,
    });
    res.send({
      status: "success",
      data: newGalleryKegiatan,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const getGalleryKegiatan = async (req, res) => {
  try {
    const galleryList = await galleryKegiatan.findAll();
    res.status(200).send({
      status: "success",
      data: galleryList,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const getDetailGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryItem = await galleryKegiatan.findByPk(id);
    if (!galleryItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }
    res.status(200).send({
      status: "success",
      data: galleryItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const updateGalleryKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const galleryItem = await galleryKegiatan.findByPk(id);
    if (!galleryItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }

    const updatedGalleryItem = await galleryItem.update({ description });
    res.status(200).send({
      status: "success",
      data: updatedGalleryItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const deleteGalleryKegiatan = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem = await galleryKegiatan.findByPk(id);
    if (!galleryItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }

    await galleryItem.destroy();
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
  createGalleryKegiatan,
  getGalleryKegiatan,
  getDetailGallery,
  updateGalleryKegiatan,
  deleteGalleryKegiatan,
};

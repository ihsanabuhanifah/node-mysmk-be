const fasilitas = require("../../models").fasilitas_smkmq;
const cloudinary = require("../../config/cloudinary");
const fs = require("fs");

// Create a new fasilitas entry
const createFasilitas = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        status: "fail",
        message: "No file uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "/ppdb/fasilitas",
    });

    const newFasilitas = await fasilitas.create({
      img_url: result.secure_url,
      description: req.body.description || "",
    });
    res.send({
      status: "success",
      data: newFasilitas,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

// Get all fasilitas entries
const getFasilitas = async (req, res) => {
  try {
    const fasilitasList = await fasilitas.findAll();
    res.status(200).send({
      status: "success",
      data: fasilitasList,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

// Get a fasilitas entry by ID
const getFasilitasById = async (req, res) => {
  try {
    const { id } = req.params;
    const fasilitasItem = await fasilitas.findByPk(id);
    if (!fasilitasItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }
    res.status(200).send({
      status: "success",
      data: fasilitasItem,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

// Update a fasilitas entry
const updateFasilitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const fasilitasItem = await fasilitas.findByPk(id);
    if (!fasilitasItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }

    const updatedFasilitas = await fasilitasItem.update({ description });
    res.status(200).send({
      status: "success",
      data: updatedFasilitas,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

// Delete a fasilitas entry
const deleteFasilitas = async (req, res) => {
  try {
    const { id } = req.params;

    const fasilitasItem = await fasilitas.findByPk(id);
    if (!fasilitasItem) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }

    await fasilitasItem.destroy();
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
  createFasilitas,
  getFasilitas,
  getFasilitasById,
  updateFasilitas,
  deleteFasilitas,
};

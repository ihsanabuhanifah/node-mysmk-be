const express = require("express");

const landingPage = express.Router();
const {
  createTestimoni,
  updateTestimoni,
  deleteTestimoni,
  getDetailTestimoni,
  listTestimoni,
} = require("../../controllers/ppdb/testimoniController");
const {
  createMitraSekolah,
  getMitraSekolahById,
  getMitraSekolah,
  updateMitraSekolah,
  deleteMitraSekolah,
} = require("../../controllers/ppdb/mitraSekolahController");
const { uploadFoto } = require("../../utils/multer");
const {
  createGalleryKegiatan,
  updateGalleryKegiatan,
  getDetailGallery,
  getGalleryKegiatan,
  deleteGalleryKegiatan,
} = require("../../controllers/ppdb/gallerykegiatan");
const {
  createFasilitas,
  updateFasilitas,
  getFasilitasById,
  getFasilitas,
  deleteFasilitas,
} = require("../../controllers/ppdb/fasilitas");

//Testimoni
landingPage.post("/testimoni/create", createTestimoni);
landingPage.put("/testimoni/update/:id", updateTestimoni);
landingPage.delete("/testimoni/delete/:id", deleteTestimoni);
landingPage.get("/testimoni/detail/:id", getDetailTestimoni);
landingPage.get("/testimoni/list", listTestimoni);

//Mitra Sekolah
landingPage.post(
  "/mitra-sekolah/create",
  uploadFoto.single("file"),
  createMitraSekolah
);
landingPage.get("/mitra-sekolah/detail/:id", getMitraSekolahById);
landingPage.get("/mitra-sekolah/list", getMitraSekolah);
landingPage.put(
  "/mitra-sekolah/update/:id",
  uploadFoto.single("file"),
  updateMitraSekolah
);
landingPage.delete("/mitra-sekolah/delete/:id", deleteMitraSekolah);

//gallery
landingPage.post(
  "/gallery/create",
  uploadFoto.single("file"),
  createGalleryKegiatan
);
landingPage.put(
  "/gallery/update/:id",
  uploadFoto.single("file"),
  updateGalleryKegiatan
);
landingPage.get("/gallery/detail/:id", getDetailGallery);
landingPage.get("/gallery/list", getGalleryKegiatan);
landingPage.delete("/gallery/delete/:id", deleteGalleryKegiatan);

//fasilitas
landingPage.post(
  "/fasilitas/create",
  uploadFoto.single("file"),
  createFasilitas
);
landingPage.put(
  "/fasilitas/update/:id",
  uploadFoto.single("file"),
  updateFasilitas
);
landingPage.get("/fasilitas/detail/:id", getFasilitasById);
landingPage.get("/fasilitas/list", getFasilitas);
landingPage.delete("/fasilitas/delete/:id", deleteFasilitas);

module.exports = landingPage;

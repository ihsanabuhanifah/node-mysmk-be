const express = require("express");
const calonSantriAccessMiddleware = require("../../middleware/calonSantriAccessMiddleware");

const ppdb = express.Router();
const {
  createInfoCalsan,
  updateInfoCalsan,
  getDetailCalsan,
  detailCalsan,
} = require("../../controllers/ppdb/InformasiCalsanController");
const {
  createTestimoni,
  updateTestimoni,
  deleteTestimoni,
  getDetailTestimoni,
  listTestimoni,
} = require("../../controllers/ppdb/testimoniController");
const { check } = require("express-validator");
const validateFields = require("./validateFields");
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
const {
  createPembayaran,
  getDetailPembayaran,
} = require("../../controllers/ppdb/pembayaranController");

const validation = [
  check("nama_siswa")
    .notEmpty()
    .isString()
    .withMessage("Nama harus berupa string"),
  check("nis").notEmpty().isString().withMessage("NIS harus berupa string"),
  check("nisn").notEmpty().isString().withMessage("NISN harus berupa string"),
  check("nik").notEmpty().isString().withMessage("NIK harus berupa string"),
  check("tempat_lahir")
    .notEmpty()
    .isString()
    .withMessage("Tempat Lahir harus berupa string"),
  check("tanggal_lahir")
    .notEmpty()
    .isString()
    .withMessage("Tanggal Lahir harus berupa string"),
  check("alamat")
    .notEmpty()
    .isString()
    .withMessage("Alamat harus berupa string"),
  check("sekolah_asal")
    .notEmpty()
    .isString()
    .withMessage("Sekolah asal harus berupa string"),
  check("jenis_kelamin")
    .notEmpty()
    .isString()
    .withMessage("Jenis kelamin harus laki - laki"),
  check("anak_ke").notEmpty().isInt().withMessage("Anak ke harus berupa angka"),
  check("nama_ayah")
    .notEmpty()
    .isString()
    .withMessage("Nama ayah harus berupa string"),
  check("nama_ibu")
    .notEmpty()
    .isString()
    .withMessage("Nama ibu harus berupa string"),
  check("pekerjaan_ayah")
    .notEmpty()
    .isString()
    .withMessage("Pekerjaan ayah harus berupa string"),
  check("pekerjaan_ibu")
    .notEmpty()
    .isString()
    .withMessage("Pekerjaan ibu harus berupa string"),
  check("nama_walil")
    .notEmpty()
    .isString()
    .withMessage("Nama wali harus berupa string"),
  check("pekerjaan_wali")
    .notEmpty()
    .isString()
    .withMessage("Pekerjaan wali harus berupa string"),
  check("hubungan")
    .notEmpty()
    .isString()
    .withMessage("Hubungan harus berupa string"),
  // (req, res, next) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  //   }
  //   next();
  // },
];

ppdb.use(calonSantriAccessMiddleware);
//Info calon santri
ppdb.post("/create", validation, validateFields, createInfoCalsan);
ppdb.put("/update/:id", validation, validateFields, updateInfoCalsan);
ppdb.get("/detail", getDetailCalsan);
ppdb.get("/detail-calsan/:id", detailCalsan);

//Testimoni
ppdb.post("/testimoni/create", createTestimoni);
ppdb.put("/testimoni/update/:id", updateTestimoni);
ppdb.delete("/testimoni/delete/:id", deleteTestimoni);
ppdb.get("/testimoni/detail/:id", getDetailTestimoni);
ppdb.get("/testimoni/list", listTestimoni);

//Mitra Sekolah
ppdb.post(
  "/mitra-sekolah/create",
  uploadFoto.single("file"),
  createMitraSekolah
);
ppdb.get("/mitra-sekolah/detail/:id", getMitraSekolahById);
ppdb.get("/mitra-sekolah/list", getMitraSekolah);
ppdb.put(
  "/mitra-sekolah/update/:id",
  uploadFoto.single("file"),
  updateMitraSekolah
);
ppdb.delete("/mitra-sekolah/delete/:id", deleteMitraSekolah);

//gallery
ppdb.post("/gallery/create", uploadFoto.single("file"), createGalleryKegiatan);
ppdb.put(
  "/gallery/update/:id",
  uploadFoto.single("file"),
  updateGalleryKegiatan
);
ppdb.get("/gallery/detail/:id", getDetailGallery);
ppdb.get("/gallery/list", getGalleryKegiatan);
ppdb.delete("/gallery/delete/:id", deleteGalleryKegiatan);

//fasilitas
ppdb.post("/fasilitas/create", uploadFoto.single("file"), createFasilitas);
ppdb.put("/fasilitas/update/:id", uploadFoto.single("file"), updateFasilitas);
ppdb.get("/fasilitas/detail/:id", getFasilitasById);
ppdb.get("/fasilitas/list", getFasilitas);
ppdb.delete("/fasilitas/delete/:id", deleteFasilitas);

//pembayaran
ppdb.post("/pembayaran-ppdb", createPembayaran);
ppdb.get("/pembayaran-ppdb/detail/:id", getDetailPembayaran);
module.exports = ppdb;

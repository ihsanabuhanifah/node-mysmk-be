const express = require("express");
const calonSantriAccessMiddleware = require("../../middleware/calonSantriAccessMiddleware");

const ppdb = express.Router();

const { login, register } = require("../../controllers/ppdb/AuthController");
const { registerValidation } = require("../../validator/auth");
const {
  createInfoCalsan,
} = require("../../controllers/ppdb/InformasiCalsanController");
const { check } = require("express-validator");
const validateFields = require("./validateFields");

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
ppdb.post("/create", validation, validateFields, createInfoCalsan);

module.exports = ppdb;

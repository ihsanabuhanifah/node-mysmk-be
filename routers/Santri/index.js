const express = require("express");
const santriAccessMiddleware = require("../../middleware/santriAccessMiddleware");
const { check, validationResult } = require("express-validator");
const validateFields = require("./validateFields");

const santri = express.Router();

// Laporan harian Pkl


const {
  profile,
  updateSiswa,
} = require("../../controllers/Santri/ProfileController");
const {
  getHasilBelajar,
  detailHasilBelajar,
} = require("../../controllers/Santri/HasilBelajarController");
const {
  getExam,
  takeExam,
  submitExam,
  progressExam,
} = require("../../controllers/Santri/ExamController");
const { listHasilUjain } = require("../../controllers/Santri/HasilUjian");
const { listTidakHadir } = require("../../controllers/Santri/Absensi");



const validateUpdate = [
  check("nama_siswa")
    .optional()
    .isString()
    .withMessage("Nama harus berupa string"),
  check("nik").optional().isString().withMessage("NIK harus berupa string"),
  check("tempat_lahir")
    .optional()
    .isString()
    .withMessage("Tempat lahir harus berupa string"),
  check("tanggal_lahir")
    .optional()
    .isDate()
    .withMessage("Tanggal lahir harus berupa tanggal yang valid"),
  check("alamat")
    .optional()
    .isString()
    .withMessage("Alamat harus berupa string"),
  check("sekolah_asal")
    .optional()
    .isString()
    .withMessage("Sekolah asal harus berupa string"),
  check("jenis_kelamin")
    .optional()
    .isString()
    .withMessage("Jenis kelamin harus laki-laki"),
  check("anak_ke").optional().isInt().withMessage("Anak ke harus berupa angka"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];





santri.use(santriAccessMiddleware);
santri.get("/profile", profile);
santri.put("/profile/update", validateFields, validateUpdate, updateSiswa);
santri.get("/exam/list", getExam);
santri.put("/exam/take/:id", takeExam);
santri.put("/exam/progress", progressExam);
santri.put("/exam/submit", submitExam);
santri.get("/hasil-belajar", getHasilBelajar);
santri.get("/hasil-belajar-detail/:id", detailHasilBelajar);
santri.get('/hasil-belajar-detail/:id/:ta_id', detailHasilBelajar)
santri.get('/hasil-ujian', listHasilUjain)
santri.get('/tidakhadir', listTidakHadir)


module.exports = santri;

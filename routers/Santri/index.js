const express = require("express");
const santriAccessMiddleware = require("../../middleware/santriAccessMiddleware");
const { check, validationResult } = require("express-validator");
const validateFields = require("./validateFields");

const santri = express.Router();
const {
  profile,
  updateSiswa,
} = require("../../controllers/Santri/ProfileController");
const {
  getExam,
  takeExam,
  submitExam,
  progressExam,
} = require("../../controllers/Santri/ExamController");
// Laporan harian Pkl
const {
  createLaporanPkl,
  updateLaporanPkl,
  laporanPklList,
  detailLaporanPkl,
} = require("../../controllers/Santri/LaporanHarianPklController");
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

// Laporan laporanDiniyyahHarian
const {
  createLaporanDiniyyah,
  laporanDiniyyahList,
  updateLaporanDiniyyah,
} = require("../../controllers/Santri/LaporanDiniyyahHarianController");

// tempat pkl
const {
  lokasiTempatPkl,
} = require("../../controllers/Santri/TempatPklController");

santri.use(santriAccessMiddleware);
santri.get("/profile", profile);
santri.put("/profile/update/:id", validateFields, validateUpdate, updateSiswa);
santri.get("/exam/list", getExam);
santri.put("/exam/take/:id", takeExam);
santri.put("/exam/progress", progressExam);
santri.put("/exam/submit", submitExam);

// Laporan Harian pkl

santri.post("/laporan-harian-pkl/create", createLaporanPkl);
santri.put("/laporan-harian-pkl/update/:id", updateLaporanPkl);
santri.get("/laporan-harian-pkl/list", laporanPklList);
santri.get("/laporan-harian-pkl/detail/:id", detailLaporanPkl);

// Laporan Diniyyah
santri.post("/laporan-diniyyah/create", createLaporanDiniyyah);
santri.get("/laporan-diniyyah/list", laporanDiniyyahList);
santri.put("/laporan-diniyyah/update/:id", updateLaporanDiniyyah);

// Tempat pkl
santri.get("/tempat-pkl/lokasi", lokasiTempatPkl);

module.exports = santri;

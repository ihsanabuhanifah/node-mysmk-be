const express = require("express");
const santriAccessMiddleware = require("../../middleware/santriAccessMiddleware");
const { check, validationResult } = require("express-validator");
const validateFields = require('./validateFields')

const santri = express.Router();
const { profile, updateSiswa } = require('../../controllers/Santri/ProfileController');
const { getExam } = require("../../controllers/Santri/ExamController");

const validateUpdate = [
  check("nama_siswa").optional().isString().withMessage("Nama harus berupa string"),
  check("nik").optional().isString().withMessage("NIK harus berupa string"),
  check("tempat_lahir").optional().isString().withMessage("Tempat lahir harus berupa string"),
  check("tanggal_lahir").optional().isDate().withMessage("Tanggal lahir harus berupa tanggal yang valid"),
  check("alamat").optional().isString().withMessage("Alamat harus berupa string"),
  check("sekolah_asal").optional().isString().withMessage("Sekolah asal harus berupa string"),
  check("jenis_kelamin").optional().isString().withMessage("Jenis kelamin harus laki-laki"),
  check("anak_ke").optional().isInt().withMessage("Anak ke harus berupa angka"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

santri.use(santriAccessMiddleware);
santri.get('/profile', profile);
santri.put('/profile/update/:id', validateFields, validateUpdate, updateSiswa);
santri.get("/exam/list", getExam )

module.exports = santri;


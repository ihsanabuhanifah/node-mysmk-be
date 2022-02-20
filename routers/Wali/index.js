const express = require("express");
const waliAccessMiddleware = require("../../middleware/waliAccessMiddleware")

const wali = express.Router();
const {
  list,
  listHalaqoh,
  resultHalaqoh,
  rekapAbsensiKehadiran
} = require("../../controllers/Wali/AbsensiController");
const { profile, create } = require("../../controllers/Wali/ProfileController");
const {listPelanggaran} = require('../../controllers/Wali/PelanggaranController')
const {listPrestasi} = require('../../controllers/Wali/PrestasiController')
wali.use(waliAccessMiddleware)
wali.get("/absensi/kelas/list", list);
wali.get("/absensi/halaqoh/list", listHalaqoh);
wali.get("/halaqoh/result", resultHalaqoh);
wali.post("/tambah", create);
wali.get("/profile", profile);
wali.get("/rekap/absensi-kelas", rekapAbsensiKehadiran)
wali.get("/pelanggaran/list" ,listPelanggaran)
wali.get("/prestasi/list" , listPrestasi)

module.exports = wali;

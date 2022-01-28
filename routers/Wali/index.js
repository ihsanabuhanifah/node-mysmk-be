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
wali.use(waliAccessMiddleware)
wali.get("/absensi/kelas/list", list);
wali.get("/absensi/halaqoh/list", listHalaqoh);
wali.get("/halaqoh/result", resultHalaqoh);
wali.post("/tambah", create);
wali.get("/profile", profile);
wali.get("/rekap/absensi-kelas", rekapAbsensiKehadiran)

module.exports = wali;

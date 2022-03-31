const express = require("express");
const waliAccessMiddleware = require("../../middleware/waliAccessMiddleware");

const wali = express.Router();
const {
  list,
  listHalaqoh,
  resultHalaqoh,
  rekapAbsensiKehadiran,
} = require("../../controllers/Wali/AbsensiController");
const { profile, create } = require("../../controllers/Wali/ProfileController");
const {
  listPelanggaran,
} = require("../../controllers/Wali/PelanggaranController");
const { listPrestasi } = require("../../controllers/Wali/PrestasiController");
const {
  buatIzin,
  listIzin,
  detailIzin,
  updateIzin,
} = require("../../controllers/Wali/KunjunganController");
const {
  buatIzinPulang,
  listIzinPulang,
  detailIzinPulang,
  updateIzinPulang,
} = require("../../controllers/Wali/PulangController");
wali.use(waliAccessMiddleware);
wali.get("/absensi/kelas/list", list);
wali.get("/absensi/halaqoh/list", listHalaqoh);
wali.get("/halaqoh/result", resultHalaqoh);
wali.post("/tambah", create);
wali.get("/profile", profile);
wali.get("/rekap/absensi-kelas", rekapAbsensiKehadiran);
wali.get("/pelanggaran/list", listPelanggaran);
wali.get("/prestasi/list", listPrestasi);
//izin
wali.post("/kunjungan/tambah", buatIzin);
wali.get("/kunjungan/list", listIzin);
wali.get("/kunjungan/detail/:id", detailIzin);
wali.put("/kunjungan/update/:id", updateIzin);
//pulang
wali.post("/pulang/tambah", buatIzinPulang);
wali.get("/pulang/list", listIzinPulang);
wali.get("/pulang/detail/:id", detailIzinPulang);
wali.put("/pulang/update/:id", updateIzinPulang);

module.exports = wali;

const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware");
const guru = express.Router();
const {
  createAbsensi,
  listAbsensi,
  updateAbsensi,
  listJadwal,
  notifikasiAbsensi,
} = require("../../controllers/Guru/AbsensiController");
const {
  listHalaqoh,
  updateHalaqoh,
  notifikasiHalaqoh,
} = require("../../controllers/Guru/HalaqohController");
const {
  listPelanggaran,
  detailPelanggaran,
  deletePelanggaran,
  createPelanggaran,
  updatePelanggaran,
} = require("../../controllers/Guru/PelanggaranController");
//absensi
guru.use(guruAccessMiddleware);
guru.post("/absensi/simpan", createAbsensi);
guru.put("/absensi/update", updateAbsensi);
guru.get("/absensi/list", listAbsensi);
guru.get("/absensi/notifikasi", notifikasiAbsensi);

guru.get("/jadwal/list", listJadwal);
//halaqoh
guru.get("/halaqoh/list", listHalaqoh);
guru.put("/halaqoh/update", updateHalaqoh);
guru.get("/halaqoh/notifikasi", notifikasiHalaqoh);

//pelanggaran

guru.get("/pelanggaran/list", listPelanggaran);
guru.get("/pelanggaran/detail/:id", detailPelanggaran);
guru.post("/pelanggaran/create", createPelanggaran);
guru.put("/pelanggaran/update/:id", updatePelanggaran);
guru.delete("/pelanggaran/delete", deletePelanggaran);
module.exports = guru;

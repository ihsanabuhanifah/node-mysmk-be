const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware")
const guru = express.Router();
const {createAbsensi, listAbsensi, updateAbsensi, listJadwal, notifikasiAbsensi} = require("../../controllers/Guru/AbsensiController")
const {listHalaqoh, updateHalaqoh, notifikasiHalaqoh} = require("../../controllers/Guru/HalaqohController")

//absensi
guru.use(guruAccessMiddleware)
guru.post("/absensi/simpan", createAbsensi)
guru.put("/absensi/update", updateAbsensi)
guru.get("/absensi/list", listAbsensi)
guru.get("/absensi/notifikasi", notifikasiAbsensi)

guru.get("/jadwal/list", listJadwal)
//halaqoh
guru.get("/halaqoh/list", listHalaqoh)
guru.put("/halaqoh/update", updateHalaqoh)
guru.get("/halaqoh/notifikasi" , notifikasiHalaqoh)
module.exports = guru;

const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware")
const guru = express.Router();
const {createAbsensi, listAbsensi, updateAbsensi, listJadwal} = require("../../controllers/Guru/AbsensiController")
const {listHalaqoh, updateHalaqoh} = require("../../controllers/Guru/HalaqohController")

//absensi
guru.use(guruAccessMiddleware)
guru.post("/absensi/simpan", createAbsensi)
guru.put("/absensi/update", updateAbsensi)
guru.get("/absensi/list", listAbsensi)
guru.get("/jadwal/list", listJadwal)
//halaqoh
guru.put("/halaqoh/list", listHalaqoh)
guru.put("/halaqoh/update", updateHalaqoh)
module.exports = guru;

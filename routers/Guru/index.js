const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware")
const guru = express.Router();
const {createAbsensi, listAbsensi, updateAbsensi} = require("../../controllers/Guru/AbsensiController")
const {listHalaqoh, updateHalaqoh} = require("../../controllers/Guru/HalaqohController")

//absensi
guru.use(guruAccessMiddleware)
guru.post("/absensi/simpan", createAbsensi)
guru.put("/absensi/update", updateAbsensi)
guru.get("/absensi/list", listAbsensi)

//halaqoh
guru.put("/halaqoh/list", listHalaqoh)
guru.put("/halaqoh/update", updateHalaqoh)
module.exports = guru;

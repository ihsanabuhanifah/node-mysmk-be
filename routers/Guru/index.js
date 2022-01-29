const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware")
const guru = express.Router();
const {create, index} = require("../../controllers/Guru/AbsensiController")

//absensi
guru.use(guruAccessMiddleware)
guru.post("/absensi/simpan", create)
guru.get("/absensi/daftar", index)
module.exports = guru;

const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware")
const guru = express.Router();
const {create} = require("../../controllers/Guru/AbsensiController")

//absensi
guru.use(guruAccessMiddleware)
guru.post("/absensi/simpan", create)

module.exports = guru;

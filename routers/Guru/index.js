const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware")
const guru = express.Router();
const {create, index ,update} = require("../../controllers/Guru/AbsensiController")

//absensi
guru.use(guruAccessMiddleware)
guru.post("/absensi/simpan", create)
guru.put("/absensi/update", update)
guru.get("/absensi/daftar", index)
module.exports = guru;

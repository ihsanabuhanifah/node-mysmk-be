const express = require("express");

const daftar = express.Router();
const { listMapel, listKelas, listKelasSiswa, listTahunAjaran } = require("../../controllers/Daftar/indexController");

daftar.get("/mata-pelajaran", listMapel);
daftar.get("/kelas", listKelas);
daftar.get("/kelas-siswa", listKelasSiswa)
daftar.get("/tahun-ajaran", listTahunAjaran)
module.exports = daftar;

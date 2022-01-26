const express = require("express");

const daftar = express.Router();
const { listMapel, listKelas,listRole, listKelasSiswa, listTahunAjaran, listGuru } = require("../../controllers/Daftar/indexController");

daftar.get("/mata-pelajaran", listMapel);
daftar.get("/kelas", listKelas);
daftar.get("/kelas-siswa", listKelasSiswa)
daftar.get("/tahun-ajaran", listTahunAjaran)
daftar.get("/guru", listGuru)
daftar.get("/roles" , listRole)
module.exports = daftar;

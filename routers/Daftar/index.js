const express = require("express");

const daftar = express.Router();
const {
  listMapel,
  listSiswa,
  listKelas,
  listRole,
  listKelasSiswa,
  listTahunAjaran,
  listGuru,
  listAlquran,
  listPelanggaran,
  listHalaqohGroup,
} = require("../../controllers/Daftar/indexController");

daftar.get("/mata-pelajaran", listMapel);
daftar.get("/kelas", listKelas);
daftar.get("/kelas-siswa", listKelasSiswa);
daftar.get("/tahun-ajaran", listTahunAjaran);
daftar.get("/guru", listGuru);
daftar.get("/roles", listRole);
daftar.get("/alquran", listAlquran);
daftar.get("/pelanggaran", listPelanggaran);
daftar.get("/siswa", listSiswa);
daftar.get("/halaqoh-grup", listHalaqohGroup);
module.exports = daftar;

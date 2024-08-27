const express = require("express");

const daftar = express.Router();
const {
  scheduleKelas,
  scheduleHalaqoh,
  
} = require("../../controllers/Admin/jadwalController");
const { createPesan } = require("../../controllers/Wali/PembayaranController");


daftar.get("/jadwal/schedule", scheduleKelas);
daftar.get("/jadwal/halaqoh/schedule", scheduleHalaqoh);
daftar.post("/tambahPesan", createPesan);
module.exports = daftar;

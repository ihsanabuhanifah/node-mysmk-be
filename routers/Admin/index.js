const express = require("express");

const daftar = express.Router();
const {
  scheduleKelas,
  scheduleHalaqoh,
  
} = require("../../controllers/Admin/jadwalController");


daftar.get("/jadwal/schedule", scheduleKelas);
daftar.get("/jadwal/halaqoh/schedule", scheduleHalaqoh);
module.exports = daftar;

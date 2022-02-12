const express = require("express");

const daftar = express.Router();
const { schedule, scheduleHalaqoh } = require("../../controllers/Admin/jadwalController");

daftar.get("/jadwal/schedule", schedule);
daftar.get("/jadwal/halaqoh/schedule", scheduleHalaqoh);
module.exports = daftar;

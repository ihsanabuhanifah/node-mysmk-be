const express = require("express");

const daftar = express.Router();
const { schedule } = require("../../controllers/Admin/jadwalController");
daftar.get("/jadwal/schedule", schedule);
module.exports = daftar;

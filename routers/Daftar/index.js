const express = require("express");

const daftar = express.Router();
const { listMapel } = require("../../controllers/Daftar/indexController");

daftar.get("/mata-pelajaran", listMapel);
module.exports = daftar;

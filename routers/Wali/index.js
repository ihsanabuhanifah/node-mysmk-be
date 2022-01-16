const express = require("express");

const wali = express.Router();
const { list } = require("../../controllers/Wali/AbsensiController");

wali.get("/absensi/list", list);

module.exports = wali;

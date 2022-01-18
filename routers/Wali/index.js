const express = require("express");

const wali = express.Router();
const { list } = require("../../controllers/Wali/AbsensiController");
const {profile} = require("../../controllers/Wali/ProfileController")
wali.get("/absensi/list", list);
wali.get("/profile", profile)

module.exports = wali;

const express = require("express");

const wali = express.Router();
const { list } = require("../../controllers/Wali/AbsensiController");
const {profile, create} = require("../../controllers/Wali/ProfileController")
wali.get("/absensi/list", list);
wali.post("/tambah" , create)
wali.get("/profile", profile)

module.exports = wali;

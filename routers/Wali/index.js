const express = require("express");

const wali = express.Router();
const {
  list,
  listHalaqoh,
} = require("../../controllers/Wali/AbsensiController");
const { profile, create } = require("../../controllers/Wali/ProfileController");
wali.get("/absensi/kelas/list", list);
wali.get("/absensi/halaqoh/list", listHalaqoh);
wali.post("/tambah", create);
wali.get("/profile", profile);

module.exports = wali;

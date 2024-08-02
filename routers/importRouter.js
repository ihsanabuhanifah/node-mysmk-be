const express = require("express");
const importRouter = express.Router();
const upload = require("../middleware/multerExcelMiddleware");
const {
  importRoles,
  importTa,
  importKelas,
  importMapel,
  importAlquran,
  importJadwal,
  importRombel,
  
  uploadImage,
  hapusFile
} = require("../controllers/ExportImport/importController");
const {
  importGuru,
  importSiswa,
  importWali,
} = require("../controllers/ExportImport/importUserController");
importRouter.post("/import/roles", upload.single("file"), importRoles);
importRouter.post("/import/guru", upload.single("file"), importGuru);
importRouter.post("/import/siswa", upload.single("file"), importSiswa);
importRouter.post("/import/wali", upload.single("file"), importWali);
importRouter.post("/import/ta", upload.single("file"), importTa);
importRouter.post("/import/mapel", upload.single("file"), importMapel);
importRouter.post("/import/kelas", upload.single("file"), importKelas);
importRouter.post("/import/alquran", upload.single("file"), importAlquran);
importRouter.post("/import/jadwal", upload.single("file"), importJadwal);
importRouter.post("/import/rombel", upload.single("file"), importRombel);
importRouter.post("/upload/file", upload.single("file"), uploadImage);
importRouter.post("/delete/file", hapusFile);
module.exports = importRouter;

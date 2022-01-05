const express = require("express");
const importRouter = express.Router();
const upload = require("../middleware/multerExcelMiddleware");
const {
  importRoles,
  importTa,
  importKelas,
  importMapel,
} = require("../controllers/ExportImport/importController");
const {
  importGuru,
  importSiswa,
  importWali
} = require("../controllers/ExportImport/importUserController");
importRouter.post("/import/roles", upload.single("file"), importRoles);
importRouter.post("/import/guru", upload.single("file"), importGuru);
importRouter.post("/import/siswa", upload.single("file"), importSiswa);
importRouter.post("/import/wali", upload.single("file"), importWali);
importRouter.post("/import/ta", upload.single("file"), importTa);
importRouter.post("/import/mapel", upload.single("file"), importMapel);
importRouter.post("/import/kelas", upload.single("file"), importKelas);
module.exports = importRouter;

const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware");
const guru = express.Router();
const excelUpload = require("../../middleware/multerExcelMiddleware");
guru.use(guruAccessMiddleware);
//Tempat Pkl

const {
  createTempatPkl,
  updateTempatPkl,
  deteleTempatPkl,
  detailTempatPkl,
  listTempatPkl,
  createBulkExcel,
} = require("../../controllers/Guru/TempatPklController");

// Laporan harian pkl
const {
  laporanPklList,
  detailLaporanPkl,
  downloadLaporanBulanan,
  downloadPdf,
  laporanPklListForPembimbing
} = require("../../controllers/Guru/LaporanHarianPklController");
//tempat_pkl
guru.post("/tempat-pkl/create", createTempatPkl);
guru.put("/tempat-pkl/update/:id", updateTempatPkl);
guru.delete("/tempat-pkl/delete/:id", deteleTempatPkl);
guru.get("/tempat-pkl/detail/:id", detailTempatPkl);
guru.get("/tempat-pkl/list", listTempatPkl);
guru.post(
  "/tempat-pkl/createBulk",
  excelUpload.single("file"),
  createBulkExcel
);
// Laporan harian pkl
guru.get("/laporan-harian-pkl/list", laporanPklList);
guru.get("/laporan-harian-pkl/detail/:id", detailLaporanPkl);
guru.get("/laporan-harian-pkl/list/pembimbing", laporanPklListForPembimbing);

guru.get("/laporan-harian-pkl/downdload-pdf/:studentId", downloadPdf);
guru.get(
  "/laporan-harian-pkl/downdload-pdf-bulanan/:studentId",
  downloadLaporanBulanan
);

module.exports = guru;

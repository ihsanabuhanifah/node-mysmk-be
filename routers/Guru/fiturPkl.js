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
  laporanPklListForPembimbing,
} = require("../../controllers/Guru/LaporanHarianPklController");
//tempat_pkl

const { createTugasPkl, tugasPklList, deleteTugasPkl, getTugasPklById, updateTugasPkl } = require("../../controllers/Guru/TugasPklController");
// tugas pkl

const { detailJawabanSantri, getJawabanByTugasPklId, listJawabanSantri, updateStatusPesanJawaban, getJawabanByTugasId } = require("../../controllers/Guru/JawabanTugasPklController")
// jawban tugas pkl

guru.get("/jawaban-tugas-pkl/detail/:id", detailJawabanSantri);
guru.get("/jawaban-tugas-pkl/detailByTugas/:tugas_pkl_id", getJawabanByTugasPklId);
guru.get("/jawaban-tugas-pkl/detailByTugasId/:tugas_pkl_id", getJawabanByTugasId);
guru.get("/jawaban-tugas-pkl/list", listJawabanSantri);
guru.put("/jawaban-tugas-pkl/update/:id", updateStatusPesanJawaban);

// jawbaan tugas pkl route

// tempat pkl
guru.post("/tempat-pkl/create", createTempatPkl);
guru.put("/tempat-pkl/update/:id", updateTempatPkl);
guru.get("/tempat-pkl/list", listTempatPkl);
guru.get("/tempat-pkl/detail/:id", detailTempatPkl);
guru.delete("/tempat-pkl/delete/:id", deteleTempatPkl);

guru.post(
  "/tempat-pkl/createBulk",
  excelUpload.single("file"),
  createBulkExcel
);
// Laporan harian pkl
guru.get("/laporan-harian-pkl/list", laporanPklList);
guru.get("/laporan-harian-pkl/detail/:id", detailLaporanPkl);
guru.get("/laporan-harian-pkl/list/pembimbing", laporanPklListForPembimbing);

guru.get("/laporan-harian-pkl/download-pdf", downloadPdf);
guru.get(
  "/laporan-harian-pkl/downdload-pdf-bulanan",
  downloadLaporanBulanan
);
// tugas pkl
guru.post("/tugas-pkl/create", createTugasPkl);
guru.get("/tugas-pkl/list", tugasPklList);
guru.get("/tugas-pkl/detail/:id", getTugasPklById);
guru.delete("/tugas-pkl/delete/:id", deleteTugasPkl);
guru.put("/tugas-pkl/update/:id", updateTugasPkl);

module.exports = guru;

const express = require("express");
const santriAccessMiddleware = require("../../middleware/santriAccessMiddleware");
const santri = express.Router();

const {
  createLaporanPkl,
  updateLaporanPkl,
  laporanPklList,
  detailLaporanPkl,
  downloadPdf,
  downloadLaporanBulanan,
  dataBulanan
} = require("../../controllers/Santri/LaporanHarianPklController");
// Laporan laporanDiniyyahHarian
const {
  createLaporanDiniyyah,
  laporanDiniyyahList,
  updateLaporanDiniyyah,
  getDetailByPklId,
} = require("../../controllers/Santri/LaporanDiniyyahHarianController");

// tempat pkl
const {
  lokasiTempatPkl,
} = require("../../controllers/Santri/TempatPklController");

santri.use(santriAccessMiddleware);
// Laporan Harian pkl

santri.post("/laporan-harian-pkl/create", createLaporanPkl);
santri.put("/laporan-harian-pkl/update/:id", updateLaporanPkl);
santri.get("/laporan-harian-pkl/list", laporanPklList);
santri.get("/laporan-harian-pkl/detail/:id", detailLaporanPkl);
santri.get("/laporan-harian-pkl/downdload-pdf", downloadPdf);
santri.get("/laporan-harian-pkl/downdload-pdf-bulanan", downloadLaporanBulanan);
santri.get("/laporan-harian-pkl/downdload-data-bulanan", dataBulanan);

// Laporan Diniyyah
santri.post("/laporan-diniyyah/create", createLaporanDiniyyah);
santri.get("/laporan-diniyyah/list", laporanDiniyyahList);
santri.get("/laporan-diniyyah/detailPkl/:id", getDetailByPklId);
santri.put("/laporan-diniyyah/update/:id", updateLaporanDiniyyah);

// Tempat pkl
santri.get("/tempat-pkl/lokasi", lokasiTempatPkl);
module.exports = santri;

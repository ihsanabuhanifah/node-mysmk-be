const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware");

const guru = express.Router();

const {getRole} = require("../../controllers/Admin/RolesController");
const {
  createAbsensi,
  listAbsensi,
  updateAbsensi,
  listJadwal,
  notifikasiAbsensi,
  guruBelumAbsen,
  rekapAbsensi,
  downloadExcelrekapAbsensi
} = require("../../controllers/Guru/AbsensiController");
const {
  listHalaqoh,
  updateHalaqoh,
  notifikasiHalaqoh,
} = require("../../controllers/Guru/HalaqohController");
const {
  listPelanggaran,
  detailPelanggaran,
  deletePelanggaran,
  createPelanggaran,
  updatePelanggaran,
} = require("../../controllers/Guru/PelanggaranController");

//kunjungan
const {
  listKunjungan,
  responseKunjungan,
} = require("../../controllers/Guru/KunjunganControler");
//pulang
const {
  listPulang,
  responsePulang,
  laporanPulang,
} = require("../../controllers/Guru/PulangController");
const {
  listPrestasi,
  createPrestasi,
  updatePrestasi,
} = require("../../controllers/Guru/PrestasiControler");

const {
  createAbsensiSholat,
  listAbsensiSholat,
  updateAbensiSholat,
  deleteAbsensiSholat,
} = require("../../controllers/Guru/AbsensiSholatController");

const {
  listPiketHariIni,
  listGuruPiketBelumLaporan,
  simpanLaporanGuruPiket,
  getDetailLaporanGuruPiket,
  notifikasiPiket
} = require("../../controllers/Guru/LaporanController");
//absensi

//jadwal

const {
  scheduleKelasManual,
  scheduleHalaqohManual,
  scheduleCek,
} = require("../../controllers/Admin/jadwalController");

guru.use(guruAccessMiddleware);

//role

guru.get("/get-role-guru", getRole);
//jadwal
guru.get("/absensi/manual", scheduleKelasManual);
guru.get("/halaqoh/manual", scheduleHalaqohManual);
guru.get("/monitor", scheduleCek);
guru.post("/absensi/simpan", createAbsensi);
guru.put("/absensi/update", updateAbsensi);
guru.get("/absensi/list", listAbsensi);
guru.get("/absensi/notifikasi", notifikasiAbsensi);
guru.get("/absensi/guru-belum-absen", guruBelumAbsen);
guru.get("/absensi/rekap", rekapAbsensi);
guru.get("/absensi/rekap/download", downloadExcelrekapAbsensi);

guru.get("/jadwal/list", listJadwal);
//halaqoh
guru.get("/halaqoh/list", listHalaqoh);
guru.put("/halaqoh/update", updateHalaqoh);
guru.get("/halaqoh/notifikasi", notifikasiHalaqoh);

//pelanggaran

guru.get("/pelanggaran/list", listPelanggaran);
guru.get("/pelanggaran/detail/:id", detailPelanggaran);
guru.post("/pelanggaran/create", createPelanggaran);
guru.put("/pelanggaran/update", updatePelanggaran);
guru.post("/pelanggaran/delete", deletePelanggaran);

//prestasi
guru.get("/prestasi/list", listPrestasi);
guru.post("/prestasi/create", createPrestasi);
guru.put("/prestasi/update", updatePrestasi);

//kunjungan

guru.get("/kunjungan/list", listKunjungan);
guru.put("/kunjungan/response", responseKunjungan);

//pulang

guru.get("/pulang/list", listPulang);
guru.put("/pulang/response", responsePulang);
guru.put("/pulang/laporan", laporanPulang);

//absensi sholat

guru.post("/absensi-sholat/create", createAbsensiSholat);
guru.get("/absensi-sholat/list", listAbsensiSholat);
guru.put("/absensi-sholat/update", updateAbensiSholat);
guru.post("/absensi-sholat/delete", deleteAbsensiSholat);

//laporan

guru.get("/laporan/guru-piket/list", listPiketHariIni);
guru.get("/laporan/guru-piket-belum-laporan/list", listGuruPiketBelumLaporan);
guru.put("/laporan/guru-piket/simpan", simpanLaporanGuruPiket);
guru.get("/laporan/guru-piket/:id/:tanggal", getDetailLaporanGuruPiket);
guru.get("/laporan/guru-piket/notifikasi", notifikasiPiket);
module.exports = guru;

const express = require("express");
const guruAccessMiddleware = require("../../middleware/guruAccessMiddleware");
//upload middleware mysmk mobile
const { upload } = require("../../middleware/uploadNoticeMiddleware");

const guru = express.Router();

const {
  getRole,
  saveToken,
} = require("../../controllers/Admin/RolesController");
const {
  createAbsensi,
  listAbsensi,
  updateAbsensi,
  listJadwal,
  notifikasiAbsensi,
  guruBelumAbsen,
  rekapAbsensi,
  downloadExcelrekapAbsensi,
  rekapAgenda,
  listJadwalAll,
  createJadwal,
} = require("../../controllers/Guru/AbsensiController");
const {
  listHalaqoh,
  updateHalaqoh,
  notifikasiHalaqoh,
  listPengampuHalaqoh,
  updatePengampuHalaqoh,
  belumAbsensitHalaqoh,
  RekapHalaqoh,
  createHalaqohStudent,
  halaqohGroup,
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
  notifikasiPiket,
} = require("../../controllers/Guru/LaporanController");
//absensi


//Tempat Pkl

const {
  createTempatPkl
} = require("../../controllers/Guru/TempatPklController")

//jadwal

const {
  scheduleKelasManual,
  scheduleHalaqohManual,
  scheduleCek,
} = require("../../controllers/Admin/jadwalController");

const { listSiswa, deleteSiswaKelas, createSiswaKelas } = require("../../controllers/Guru/SiswaController");
const {
  listHalaqohGroup,
} = require("../../controllers/Daftar/indexController");

//notice controller mysmk mobile
const {
  getNotice,
  getSingleNotice,
  saveNotice,
  updateNotice,
  deleteNotice,
} = require("../../controllers/noticeController");
const {
  createSoal,
  listSoal,
  detailSoal,
  updateSoal,
  deleteSoal,
} = require("../../controllers/Guru/BankSoalController");
const {
  createUjian,
  listUjian,
  detailUjian,
  updateUjian,
  deleteUjian,
} = require("../../controllers/Guru/UjianController");
const { createKehadiran, listKehadiran, submitDatang, submitPulang, submitIzin } = require("../../controllers/Guru/KehadiranGuruController");



guru.use(guruAccessMiddleware);

//absensi kehadairan
guru.post("/create/kehadiran", createKehadiran)
guru.get("/list/kehadiran", listKehadiran)
guru.put("/submit-datang/kehadiran", submitDatang)
guru.put("/submit-pulang/kehadiran", submitPulang)
guru.put("/submit-izin/kehadiran", submitIzin)

//role

guru.get("/get-role-guru", getRole);
guru.put("/token/save", saveToken);
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
guru.get("/agenda/rekap", rekapAgenda);

guru.get("/jadwal/list", listJadwal);
guru.get("/jadwal/list-all", listJadwalAll);
guru.post("/jadwal/create", createJadwal);
//halaqoh
guru.get("/halaqoh/list", listHalaqoh);
guru.put("/halaqoh/update", updateHalaqoh);
guru.get("/halaqoh/notifikasi", notifikasiHalaqoh);
guru.get("/halaqoh/pengampu/list", listPengampuHalaqoh);
guru.put("/halaqoh/pengampu/update", updatePengampuHalaqoh);
guru.get("/halaqoh/belum-absensi", belumAbsensitHalaqoh);
guru.get("/halaqoh/absensi/rekap", RekapHalaqoh);
guru.post("/halaqoh/student/create", createHalaqohStudent);
guru.get("/halaqoh/student/list", halaqohGroup);
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

//siswa

guru.get("/siswa/list", listSiswa);
guru.post("/siswa/kelas/create", createSiswaKelas);
guru.delete("/siswa/kelas/delete/:id", deleteSiswaKelas)

//list

guru.get("/halaqoh-grup/list", listHalaqohGroup);

//Notice mysmk mobile
guru.get("/notice/list", getNotice);
guru.get("/notice/list/:id", getSingleNotice);
guru.post("/notice/save", upload.single("gambar_notice"), saveNotice);
guru.put("/notice/update/:id", upload.single("gambar_notice"), updateNotice);
guru.delete("/notice/delete/:id", deleteNotice);

//exam
//bank soal

guru.post("/bank-soal/create", createSoal);
guru.get("/bank-soal/list", listSoal);
guru.get("/bank-soal/detail/:id", detailSoal);
guru.put("/bank-soal/update/:id", updateSoal);
guru.post("/bank-soal/delete", deleteSoal);

//ujian

guru.post("/ujian/create", createUjian);
guru.get("/ujian/list", listUjian);
guru.get("/ujian/detail/:id", detailUjian);
guru.put("/ujian/update/:id", updateUjian);
guru.delete("/ujian/delete/:id", deleteUjian);

//tempat_pkl
guru.post("/tempat-pkl/create", createTempatPkl)


module.exports = guru;

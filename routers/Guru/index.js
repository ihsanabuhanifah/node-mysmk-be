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
  pelanggaran,
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
  createTempatPkl,
  updateTempatPkl,
  deteleTempatPkl,
  detailTempatPkl,
  listTempatPkl,
} = require("../../controllers/Guru/TempatPklController");

// Laporan harian pkl
const {
  laporanPklList,
  detailLaporanPkl,
  laporanPklListForPembimbing,
} = require("../../controllers/Guru/LaporanHarianPklController");

//jadwal

const {
  scheduleKelasManual,
  scheduleHalaqohManual,
  scheduleCek,
} = require("../../controllers/Admin/jadwalController");

const {
  listSiswa,
  deleteSiswaKelas,
  createSiswaKelas,
  detailSiswa,
  updateSiswa,
  getHasilBelajar,
  detailHasilBelajar,
} = require("../../controllers/Guru/SiswaController");
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
  createPenilaian,
} = require("../../controllers/Guru/UjianController");
const {
  createKehadiran,
  listKehadiran,
  submitDatang,
  submitPulang,
  submitIzin,
  submitByAdmin,
} = require("../../controllers/Guru/KehadiranGuruController");
const adminAccessMiddleware = require("../../middleware/adminAccessMiddleware");
const { listPenilaianByTeacher, remidial } = require("../../controllers/Guru/NilaiController");
const { getListWali, updateWali, detailWali } = require("../../controllers/Guru/WaliController");
const { ListPembayaran, createKartuSpp, updateAprroval, detailPembayaran, deleteKartu, daftarSiswa, detailPembayaranSiswa, createNotification, updateResponse } = require("../../controllers/Wali/PembayaranController");

const {
  

  refreshCount,
  getSoal,
  updateLastExam,
  submitExamResult,
} = require("../../controllers/Guru/NilaiController");

const {
  listReport,
  generateReport,
} = require("../../controllers/Guru/RaportController");

guru.use(guruAccessMiddleware);

//absensi kehadairan
guru.post("/create/kehadiran", createKehadiran);
guru.get("/list/kehadiran", listKehadiran);
guru.put("/submit-datang/kehadiran", submitDatang);
guru.put("/submit-pulang/kehadiran", submitPulang);
guru.put("/submit-izin/kehadiran", submitIzin);
guru.put("/submit-by-Admin/kehadiran", adminAccessMiddleware, submitByAdmin);

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
guru.get("/pelanggaran/list/:id", pelanggaran);
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
guru.get("/siswa/detail/:id", detailSiswa);
guru.put("/siswa/update/:id", updateSiswa);
guru.put("/siswa/kelas/delete/:id", deleteSiswaKelas);
guru.post("/siswa/kelas/create", createSiswaKelas);
guru.delete("/siswa/kelas/delete/:id", deleteSiswaKelas);
// task rizky
guru.get("/siswa/hasil-belajar/:id", getHasilBelajar);
guru.get("/siswa/detail-hasil-belajar/:id/:id_siswa", detailHasilBelajar);

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
guru.post("/nilai/create", createPenilaian);
guru.put("/nilai/update-last-exam", updateLastExam);
guru.put("/nilai/exam-result", submitExamResult);

//nilai

guru.get("/nilai/list/teacher", listPenilaianByTeacher);
guru.put("/nilai/remidial/teacher", remidial);
guru.put("/nilai/refresh/teacher", refreshCount);
guru.get("/nilai/soal/teacher/:id", getSoal);

//report

guru.get("/report/list", listReport);
guru.post("/report/generate", generateReport);

//tempat_pkl
guru.post("/tempat-pkl/create", createTempatPkl);
guru.put("/tempat-pkl/update/:id", updateTempatPkl);
guru.delete("/tempat-pkl/delete/:id", deteleTempatPkl);
guru.get("/tempat-pkl/detail/:id", detailTempatPkl);
guru.get("/tempat-pkl/list", listTempatPkl);

// Walisantri
guru.get("/walisantri/list", getListWali);
guru.post("/walisantri/create", createBulkWali);
guru.put("/walisantri/update/:id", updateWali);
guru.get("/walisantri/detail/:id", detailWali)




// Pembayaran
guru.get("/pembayaran/list", ListPembayaran);
guru.post("/pembayaran/createKartu", createKartuSpp);
guru.get("/pembayaran/detail/:id", detailPembayaran);
guru.put("/pembayaran/update", updateResponse);


// siswa
guru.get("/siswa/daftarSpp", daftarSiswa);
guru.get("/siswa/listPembayaran/:student_id", detailPembayaranSiswa);
guru.post("/pesan/create", createNotification)
// Laporan harian pkl
guru.get("/laporan-harian-pkl/list", laporanPklList);
guru.get("/laporan-harian-pkl/detail/:id", detailLaporanPkl);
guru.get("/laporan-harian-pkl/list/pembimbing", laporanPklListForPembimbing);

guru.get("/walisantri/list", getListWali);
guru.post("/walisantri/create", createBulkWali);
guru.get("/laporan-harian-pkl/list", laporanPklList)
guru.get("/laporan-harian-pkl/detail/:id", detailLaporanPkl)

module.exports = guru;

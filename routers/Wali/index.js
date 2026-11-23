const express = require("express");
const waliAccessMiddleware = require("../../middleware/waliAccessMiddleware");

const wali = express.Router();
const {
  list,
  listHalaqoh,
  resultHalaqoh,
  rekapAbsensiKehadiran,
} = require("../../controllers/Wali/AbsensiController");
const { profile } = require("../../controllers/Wali/ProfileController");
const {
  listPelanggaran,
} = require("../../controllers/Wali/PelanggaranController");
const { listPrestasi } = require("../../controllers/Wali/PrestasiController");
const {
  buatIzin,
  listIzin,
  detailIzin,
  updateIzin,
} = require("../../controllers/Wali/KunjunganController");
const {
  buatIzinPulang,
  listIzinPulang,
  detailIzinPulang,
  updateIzinPulang,
} = require("../../controllers/Wali/PulangController");
//notice mobile
const {
  getNotice
} = require("../../controllers/noticeController");
const { createPembayaran, ListPembayaran, detailPembayaran, createPembayaranOtomatis, createNotifPembayaran, daftarSiswa, detailPembayaranSiswa} = require("../../controllers/Wali/PembayaranController");

const {
  paksaSantriSendiri,
  cekTagihanMilikSendiri,
  daftarSiswaSendiri,
} = require("../../middleware/waliPembayaranGuard");

const { listRaport, listRaportDetail, listExam } = require("../../controllers/Wali/NilaiController");


wali.use(waliAccessMiddleware);
wali.get("/absensi/kelas/list", list);
wali.get("/absensi/halaqoh/list", listHalaqoh);
wali.get("/halaqoh/result", resultHalaqoh);
// POST /tambah dihapus: handler `create` kosong dan tidak pernah merespons
wali.get("/profile", profile);
wali.get("/rekap/absensi-kelas", rekapAbsensiKehadiran);
wali.get("/pelanggaran/list", listPelanggaran);
wali.get("/prestasi/list", listPrestasi);
//izin
wali.post("/kunjungan/tambah", buatIzin);
wali.get("/kunjungan/list", listIzin);
wali.get("/kunjungan/detail/:id", detailIzin);
wali.put("/kunjungan/update/:id", updateIzin);
//pulang
wali.post("/pulang/tambah", buatIzinPulang);
wali.get("/pulang/list", listIzinPulang);
wali.get("/pulang/detail/:id", detailIzinPulang);
wali.put("/pulang/update/:id", updateIzinPulang);
//notice
wali.get("/notice/list", getNotice);
//Pembayaran
wali.get("/pembayaran/listsiswa", daftarSiswaSendiri);
wali.get("/pembayaran/detailSiswa/:student_id", paksaSantriSendiri, detailPembayaranSiswa);
// dulu ListPembayaran (semua santri) -> sekarang hanya tagihan santri sendiri
wali.get("/pembayaran/list", paksaSantriSendiri, detailPembayaranSiswa);
wali.get("/pembayaran/detail/:id", cekTagihanMilikSendiri, detailPembayaran);
wali.put("/pembayaran/bayar/:id", cekTagihanMilikSendiri, createPembayaran);
wali.put("/pembayaran/otomatis/:id", cekTagihanMilikSendiri, createPembayaranOtomatis);



wali.get("/raport/list", listRaport);
wali.get("/exam/list", listExam);
wali.get("/raport/detail/:mapel_id/:kelas_id/:ta_id", listRaportDetail);

module.exports = wali;

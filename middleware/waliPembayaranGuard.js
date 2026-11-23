// Pengaman endpoint pembayaran untuk Wali Santri:
// wali hanya boleh melihat / membayar tagihan SPP milik santrinya sendiri (req.StudentId).
const models = require("../models");

// Parameter rentang di detailPembayaranSiswa menimpa filter student_id -> dibuang untuk wali.
const PARAM_RENTANG = ["dari_bulan", "ke_bulan", "dari_tahun", "ke_tahun"];

function buangParamRentang(req) {
  PARAM_RENTANG.forEach((k) => delete req.query[k]);
}

/** Paksa :student_id (atau tambahkan) = santri milik wali. */
function paksaSantriSendiri(req, res, next) {
  if (!req.StudentId) {
    return res.status(403).json({ status: "Fail", msg: "Akun wali belum terhubung dengan santri" });
  }
  buangParamRentang(req);
  req.params.student_id = String(req.StudentId);
  next();
}

/** Tagihan :id harus milik santri wali ini. */
async function cekTagihanMilikSendiri(req, res, next) {
  try {
    const row = await models.pembayaran_spp.findByPk(req.params.id, {
      attributes: ["id", "student_id"],
    });
    if (!row || Number(row.student_id) !== Number(req.StudentId)) {
      return res.status(404).json({ status: "Fail", msg: "Tagihan tidak ditemukan" });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

/** Pengganti daftarSiswa: wali hanya mendapat santrinya sendiri (bentuk respons sama). */
async function daftarSiswaSendiri(req, res) {
  try {
    const siswa = await models.student.findByPk(req.StudentId);
    const rows = siswa ? [siswa] : [];
    return res.status(201).json({
      status: "Success",
      msg: "Daftar siswa",
      data: { count: rows.length, rows },
      page: req.query.page,
      pageSize: req.query.pageSize,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { paksaSantriSendiri, cekTagihanMilikSendiri, daftarSiswaSendiri };

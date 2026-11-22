// Kontrol akses data ujian/nilai/bank soal milik guru.
// Guru hanya boleh mengelola ujian & soal miliknya sendiri, kecuali role pengelola.
const models = require("../models");

const ROLE_PENGELOLA = ["Super Administrator", "Admin", "Kurikulum", "Kepala Sekolah"];

const isPengelola = (req) =>
  (req.allRole || []).some((r) => ROLE_PENGELOLA.includes(r));

const bolehKelola = (req, teacherId) =>
  isPengelola(req) || Number(teacherId) === Number(req.teacher_id);

/** Ambil ujian bila boleh dikelola; null bila tidak ada / bukan milik. */
async function ujianMilik(req, ujianId, opsi = {}) {
  if (!ujianId) return null;
  const ujian = await models.ujian.findByPk(ujianId, opsi);
  if (!ujian) return null;
  return bolehKelola(req, ujian.teacher_id) ? ujian : null;
}

/**
 * Saring daftar id nilai: hanya yang ujiannya boleh dikelola req.
 * @returns array id nilai yang diizinkan
 */
async function saringNilaiMilik(req, nilaiIds) {
  const ids = [...new Set((nilaiIds || []).map(Number).filter(Boolean))];
  if (!ids.length) return [];
  const rows = await models.nilai.findAll({
    where: { id: ids },
    attributes: ["id"],
    include: [{ model: models.ujian, as: "ujian", attributes: ["teacher_id"], required: true }],
  });
  return rows.filter((r) => bolehKelola(req, r.ujian.teacher_id)).map((r) => r.id);
}

const TIDAK_BERHAK = {
  statusCode: 403,
  msg: "Anda tidak memiliki akses ke ujian ini (milik guru lain)",
};

module.exports = { ROLE_PENGELOLA, isPengelola, bolehKelola, ujianMilik, saringNilaiMilik, TIDAK_BERHAK };

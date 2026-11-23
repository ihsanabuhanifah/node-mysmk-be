// Absensi untuk Wali Santri. Semua data dibatasi ke santri milik wali (req.StudentId).
// Filter memakai replacements Sequelize (bukan string interpolation) agar aman dari SQL injection.
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();
const { formatDate } = require("../../utils/format");
const { arahUrut, paginasi, infoHalaman } = require("../../utils/sqlWali");

function hitungPeriode(rows, orderBy) {
  const pertama = rows[rows.length - 1];
  const terakhir = rows[0];
  return orderBy === "desc"
    ? `${formatDate(pertama?.tanggal)} - ${formatDate(terakhir?.tanggal)}`
    : `${formatDate(terakhir?.tanggal)} - ${formatDate(pertama?.tanggal)}`;
}

async function list(req, res) {
  try {
    const { tahunAjaran, semester, statusKehadiran, dariTanggal, sampaiTanggal, namaMapel } =
      req.query;
    const orderBy = arahUrut(req.query.orderBy);
    const pg = paginasi(req.query.page, req.query.pageSize);

    const where = ["a.student_id = :studentId"];
    const rep = { studentId: req.StudentId, ...pg.replacements };
    if (namaMapel !== undefined) { where.push("d.nama_mapel = :namaMapel"); rep.namaMapel = namaMapel; }
    if (tahunAjaran !== undefined) { where.push("f.nama_tahun_ajaran = :tahunAjaran"); rep.tahunAjaran = tahunAjaran; }
    if (semester !== undefined) { where.push("a.semester = :semester"); rep.semester = semester; }
    if (statusKehadiran !== undefined) {
      where.push("g.nama_status_kehadiran = :statusKehadiran");
      rep.statusKehadiran = statusKehadiran;
    }
    if (dariTanggal !== undefined && sampaiTanggal !== undefined) {
      where.push("a.tanggal BETWEEN :dariTanggal AND :sampaiTanggal");
      rep.dariTanggal = dariTanggal;
      rep.sampaiTanggal = sampaiTanggal;
    }

    const absensi = await sequelize.query(
      `SELECT DISTINCT
        a.id,
        a.tanggal,
        e.nama_guru,
        h.materi,
        b.nama_siswa,
        c.nama_kelas,
        d.nama_mapel,
        h.jam_ke,
        g.nama_status_kehadiran AS status_kehadiran,
        a.keterangan,
        a.semester,
        f.nama_tahun_ajaran AS tahun_ajaran,
        a.created_at,
        a.updated_at
      FROM absensi_kelas AS a
      LEFT JOIN students AS b ON (a.student_id = b.id)
      LEFT JOIN kelas AS c ON (a.kelas_id = c.id)
      LEFT JOIN mapels AS d ON (a.mapel_id = d.id)
      LEFT JOIN teachers AS e ON (a.teacher_id = e.id)
      LEFT JOIN ta AS f ON (a.ta_id = f.id)
      LEFT JOIN status_kehadirans AS g ON (a.status_kehadiran = g.id)
      LEFT JOIN agenda_kelas AS h ON (a.tanggal = h.tanggal AND a.teacher_id = h.teacher_id AND a.mapel_id = h.mapel_id AND a.kelas_id = h.kelas_id)
      WHERE ${where.join(" AND ")}
      ORDER BY a.tanggal ${orderBy}, h.jam_ke asc
      ${pg.limit};`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    if (absensi.length === 0) {
      return res.json({
        status: "Fail",
        msg: "Tidak ditemukan absensi kelas pada periode yang dipilih",
        student_id: req.StudentId,
      });
    }

    return res.json({
      status: "Success",
      msg: "Data  Absensi Kelas ditemukan",
      periode: hitungPeriode(absensi, orderBy),
      ...infoHalaman(pg, absensi.length),
      data: absensi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

const persen = (n, total, suffix = " %") =>
  `${total > 0 ? Math.round((Number(n) / Number(total)) * 100) : 0}${suffix}`;

async function rekapAbsensiKehadiran(req, res) {
  const { tahunAjaran, semester, mapel } = req.query;
  const where = ["a.student_id = :studentId"];
  const rep = { studentId: req.StudentId };
  if (semester !== undefined) { where.push("a.semester = :semester"); rep.semester = semester; }
  if (tahunAjaran !== undefined) { where.push("b.nama_tahun_ajaran = :tahunAjaran"); rep.tahunAjaran = tahunAjaran; }
  if (mapel !== undefined) { where.push("c.nama_mapel = :mapel"); rep.mapel = mapel; }

  try {
    const absensi = await sequelize.query(
      `SELECT
        COUNT(a.status_kehadiran) AS jumlah_absensi,
        COUNT(IF(a.status_kehadiran = 1, a.student_id, NULL)) AS hadir,
        COUNT(IF(a.status_kehadiran = 2, a.student_id, NULL)) AS sakit,
        COUNT(IF(a.status_kehadiran = 3, a.student_id, NULL)) AS izin,
        COUNT(IF(a.status_kehadiran = 4, a.student_id, NULL)) AS dispensasi,
        COUNT(IF(a.status_kehadiran = 5, a.student_id, NULL)) AS tanpa_keterangan
      FROM absensi_kelas AS a
      LEFT JOIN ta AS b ON (a.ta_id = b.id)
      LEFT JOIN mapels AS c ON (a.mapel_id = c.id)
      WHERE ${where.join(" AND ")}`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    const r = absensi[0];
    const total = r.jumlah_absensi;
    r.persentase_kehadiran = persen(r.hadir, total);
    r.persentase_sakit = persen(r.sakit, total);
    r.persentase_izin = persen(r.izin, total);
    r.persentase_dispensasi = persen(r.dispensasi, total, "%");
    r.persentase_tanpa_keterangan = persen(r.tanpa_keterangan, total, "%");

    return res.json({
      status: "Success",
      mapel: req.query.mapel,
      semester: req.query.semester,
      tahunAjaran: req.query.tahunAjaran,
      data: absensi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

async function listHalaqoh(req, res) {
  try {
    const { tahunAjaran, semester, statusKehadiran, dariTanggal, sampaiTanggal } = req.query;
    const orderBy = arahUrut(req.query.orderBy);
    const pg = paginasi(req.query.page, req.query.pageSize);

    const where = ["a.student_id = :studentId"];
    const rep = { studentId: req.StudentId, ...pg.replacements };
    if (semester !== undefined) { where.push("b.semester = :semester"); rep.semester = semester; }
    if (tahunAjaran !== undefined) { where.push("h.nama_tahun_ajaran = :tahunAjaran"); rep.tahunAjaran = tahunAjaran; }
    if (dariTanggal !== undefined && sampaiTanggal !== undefined) {
      where.push("a.tanggal BETWEEN :dariTanggal AND :sampaiTanggal");
      rep.dariTanggal = dariTanggal;
      rep.sampaiTanggal = sampaiTanggal;
    }
    if (statusKehadiran !== undefined) {
      where.push("f.nama_status_kehadiran = :statusKehadiran");
      rep.statusKehadiran = statusKehadiran;
    }

    const absensi = await sequelize.query(
      `SELECT
        a.id,
        a.tanggal,
        b.nama_kelompok,
        g.nama_guru,
        c.nama_surat AS dari_surat,
        c.nama_surat_arabic AS dari_surat_arabic,
        a.dari_ayat,
        d.nama_surat AS sampai_surat,
        d.nama_surat_arabic AS sampai_surat_arabic,
        a.sampai_ayat,
        a.total_halaman,
        a.tipe,
        f.nama_status_kehadiran AS status_kehadiran,
        b.semester AS semester,
        h.nama_tahun_ajaran AS tahun_ajaran,
        a.keterangan,
        a.created_at,
        a.updated_at
      FROM absensi_halaqohs AS a
      LEFT JOIN halaqohs AS b ON (a.halaqoh_id = b.id)
      LEFT JOIN alqurans AS c ON (a.dari_surat = c.id)
      LEFT JOIN alqurans AS d ON (a.sampai_surat = d.id)
      LEFT JOIN status_kehadirans AS f ON (a.status_kehadiran = f.id)
      LEFT JOIN teachers AS g ON (b.teacher_id = g.id)
      LEFT JOIN ta AS h ON (b.ta_id = h.id)
      WHERE ${where.join(" AND ")}
      ORDER BY a.tanggal ${orderBy}
      ${pg.limit};`,
      { type: QueryTypes.SELECT, replacements: rep }
    );

    if (absensi.length === 0) {
      return res.json({
        status: "Fail",
        msg: "Tidak ditemukan absensi halaqoh pada periode yang dipilih",
      });
    }

    return res.json({
      status: "Success",
      msg: "Data  Absensi Halaqoh ditemukan",
      periode: hitungPeriode(absensi, orderBy),
      ...infoHalaman(pg, absensi.length),
      data: absensi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

async function resultHalaqoh(req, res) {
  try {
    const absensi = await sequelize.query(
      `SELECT
        a.id,
        a.tanggal,
        b.nama_surat AS dari_surat,
        b.nama_surat_arabic AS dari_surat_arabic,
        a.dari_ayat,
        c.nama_surat AS sampai_surat,
        c.nama_surat_arabic AS sampai_surat_arabic,
        a.sampai_ayat,
        a.total_halaman,
        a.juz_ke,
        a.created_at,
        a.updated_at
      FROM absensi_halaqohs AS a
      LEFT JOIN alqurans AS b ON (a.dari_surat = b.id)
      LEFT JOIN alqurans AS c ON (a.sampai_surat = c.id)
      WHERE a.student_id = :studentId
      ORDER BY a.tanggal DESC`,
      { type: QueryTypes.SELECT, replacements: { studentId: req.StudentId } }
    );

    if (absensi.length === 0) {
      return res.json({
        status: "Fail",
        msg: "Tidak ditemukan absensi pada siswa yang bersangkutan",
      });
    }

    return res.json({
      status: "Success",
      msg: "Data Pencapaian Halaqoh Santri",
      data: {
        // data terbaru ada di baris pertama (urut tanggal DESC)
        updateTanggal: absensi[0]?.created_at,
        data: absensi,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { list, listHalaqoh, resultHalaqoh, rekapAbsensiKehadiran };

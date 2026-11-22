// Dashboard guru: data pribadi guru yang login + gambaran sekolah (+ perhatian untuk admin)
const models = require("../../models");
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const { STATUS_PINDAH_SEKOLAH } = require("../../utils/statusAkun");

const HARI = ["ahad", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

// Tanggal & hari dalam zona WIB
function hariIniWIB() {
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  return {
    tanggal: now.toISOString().slice(0, 10),
    hariIdx: now.getUTCDay(),
  };
}

const q = (sql, replacements = {}) =>
  sequelize.query(sql, { type: QueryTypes.SELECT, replacements });

async function jadwalHari(teacherId, hari) {
  return q(
    `SELECT j.id, j.jam_ke, j.jumlah_jam, j.kelas_id, j.mapel_id, j.semester,
            k.nama_kelas, m.nama_mapel
       FROM jadwals j
       LEFT JOIN kelas k ON k.id = j.kelas_id
       LEFT JOIN mapels m ON m.id = j.mapel_id
      WHERE j.teacher_id = :t AND j.status = 1 AND j.hari = :hari
      ORDER BY j.jam_ke ASC`,
    { t: teacherId, hari }
  );
}

// GET /guru/dashboard
async function dashboardGuru(req, res) {
  try {
    const { tanggal, hariIdx } = hariIniWIB();
    const isAdmin = (req.allRole || []).some((r) =>
      ["Admin", "Super Administrator"].includes(r)
    );

    // ---- Guru yang login ----
    let teacherId = req.teacher_id;
    if (!teacherId && req.id) {
      const t = await models.teacher.findOne({ where: { user_id: req.id }, attributes: ["id"] });
      teacherId = t?.id;
    }
    const guru = teacherId
      ? await models.teacher.findByPk(teacherId, { attributes: ["id", "nama_guru"], raw: true })
      : null;

    const taAktif = (
      await q(`SELECT id, nama_tahun_ajaran FROM ta ORDER BY nama_tahun_ajaran DESC LIMIT 1`)
    )[0];

    let pribadi = null;
    if (guru) {
      // Jadwal hari ini + status absensi kelasnya
      let jadwalHariIni = await jadwalHari(guru.id, HARI[hariIdx]);
      if (jadwalHariIni.length) {
        const absensi = await q(
          `SELECT kelas_id, mapel_id, COUNT(*) AS total, SUM(status_absensi = 1) AS sudah
             FROM absensi_kelas
            WHERE teacher_id = :t AND tanggal = :tgl
            GROUP BY kelas_id, mapel_id`,
          { t: guru.id, tgl: tanggal }
        );
        jadwalHariIni = jadwalHariIni.map((j) => {
          const a = absensi.find(
            (x) => Number(x.kelas_id) === Number(j.kelas_id) && Number(x.mapel_id) === Number(j.mapel_id)
          );
          let status_absensi = "belum_dibuat";
          if (a) status_absensi = Number(a.sudah) >= Number(a.total) ? "sudah" : "belum";
          return { ...j, status_absensi };
        });
      }

      // Jadwal hari berikutnya (bila hari ini kosong)
      let jadwalBerikutnya = null;
      if (!jadwalHariIni.length) {
        for (let i = 1; i <= 7; i++) {
          const idx = (hariIdx + i) % 7;
          const list = await jadwalHari(guru.id, HARI[idx]);
          if (list.length) {
            jadwalBerikutnya = { hari: HARI[idx], jadwal: list };
            break;
          }
        }
      }

      const [ringkas] = await q(
        `SELECT COALESCE(SUM(jumlah_jam), 0) AS jam_per_minggu,
                COUNT(DISTINCT kelas_id) AS jumlah_kelas,
                COUNT(DISTINCT mapel_id) AS jumlah_mapel
           FROM jadwals WHERE teacher_id = :t AND status = 1`,
        { t: guru.id }
      );
      const [ujian] = await q(
        `SELECT SUM(NOW() BETWEEN waktu_mulai AND waktu_selesai) AS berjalan,
                SUM(DATE(waktu_mulai) = :tgl) AS hari_ini
           FROM ujians WHERE teacher_id = :t AND status = 'open'`,
        { t: guru.id, tgl: tanggal }
      );
      const [halaqoh] = await q(
        `SELECT COUNT(*) AS jumlah FROM halaqohs WHERE teacher_id = :t`,
        { t: guru.id }
      );
      const kehadiran = await models.kehadiran_guru.findOne({
        where: { teacher_id: guru.id, tanggal },
        attributes: ["status", "jam_datang", "jam_pulang"],
        raw: true,
      });

      pribadi = {
        guru,
        kehadiranHariIni: kehadiran || null,
        jadwalHariIni,
        jadwalBerikutnya,
        ringkasan: {
          jam_per_minggu: Number(ringkas.jam_per_minggu),
          jumlah_kelas: Number(ringkas.jumlah_kelas),
          jumlah_mapel: Number(ringkas.jumlah_mapel),
          ujian_berjalan: Number(ujian.berjalan || 0),
          ujian_hari_ini: Number(ujian.hari_ini || 0),
          halaqoh: Number(halaqoh.jumlah),
        },
      };
    }

    // ---- Gambaran sekolah ----
    const [angka] = await q(
      `SELECT
         (SELECT COUNT(*) FROM kelas_students WHERE status = 1) AS siswa_aktif,
         (SELECT COUNT(DISTINCT kelas_id) FROM kelas_students WHERE status = 1) AS kelas_aktif,
         (SELECT COUNT(*) FROM teachers WHERE status = 'active') AS guru_aktif,
         (SELECT COUNT(*) FROM kelas_students ks JOIN kelas k ON k.id = ks.kelas_id
           WHERE k.nama_kelas LIKE '%alumni%') AS alumni`
    );
    const siswaPerKelas = await q(
      `SELECT k.id, k.nama_kelas, COUNT(*) AS jumlah
         FROM kelas_students ks JOIN kelas k ON k.id = ks.kelas_id
        WHERE ks.status = 1
        GROUP BY k.id, k.nama_kelas
        ORDER BY k.nama_kelas`
    );
    // 7 hari terakhir yang punya data absensi (sudah diisi)
    const trenKehadiran = (
      await q(
        `SELECT tanggal, COUNT(*) AS total, SUM(status_kehadiran = 1) AS hadir
           FROM absensi_kelas
          WHERE status_absensi = 1
            AND status_kehadiran <> 6 -- 6 = "belum absensi" (tidak diisi), tidak dihitung
          GROUP BY tanggal
          ORDER BY tanggal DESC
          LIMIT 7`
      )
    )
      .reverse()
      .map((r) => ({
        tanggal: r.tanggal,
        total: Number(r.total),
        hadir: Number(r.hadir),
        persen: r.total ? Math.round((Number(r.hadir) / Number(r.total)) * 100) : 0,
      }));

    // ---- Perlu perhatian (admin) ----
    let perhatian = null;
    if (isAdmin) {
      const [p] = await q(
        `SELECT
           (SELECT COUNT(*) FROM students s
             WHERE NOT EXISTS (SELECT 1 FROM kelas_students ks WHERE ks.student_id = s.id)) AS siswa_tanpa_kelas,
           (SELECT COUNT(DISTINCT t.id) FROM teachers t JOIN jadwals j ON j.teacher_id = t.id AND j.status = 1
             WHERE t.status <> 'active') AS guru_nonaktif_berjadwal,
           (SELECT COUNT(DISTINCT r.student_id) FROM riwayat_kelas r
              JOIN students s ON s.id = r.student_id JOIN users u ON u.id = s.user_id
             WHERE r.jenis = 'pindah_sekolah' AND u.status <> :pindah) AS pindah_belum_diblokir`,
        { pindah: STATUS_PINDAH_SEKOLAH }
      );
      perhatian = {
        siswa_tanpa_kelas: Number(p.siswa_tanpa_kelas),
        guru_nonaktif_berjadwal: Number(p.guru_nonaktif_berjadwal),
        pindah_belum_diblokir: Number(p.pindah_belum_diblokir),
      };
    }

    return res.json({
      status: "Success",
      data: {
        tanggal,
        hari: HARI[hariIdx],
        taAktif: taAktif || null,
        pribadi,
        sekolah: {
          siswa_aktif: Number(angka.siswa_aktif),
          kelas_aktif: Number(angka.kelas_aktif),
          guru_aktif: Number(angka.guru_aktif),
          alumni: Number(angka.alumni),
          siswaPerKelas: siswaPerKelas.map((r) => ({ ...r, jumlah: Number(r.jumlah) })),
          trenKehadiran,
        },
        perhatian,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { dashboardGuru };

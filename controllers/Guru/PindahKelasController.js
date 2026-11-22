// Pindah / naik kelas siswa + riwayat kelas.
//
// kelas_students (rombel): keanggotaan kelas per tahun ajaran & semester
//   status = 1 -> kelas AKTIF (dipakai login, absensi otomatis, ujian, dsb.)
//   status = 0 -> periode yang sudah lewat / dinonaktifkan
// riwayat_kelas: log setiap perubahan (siapa, kapan, dari mana ke mana, jenis)
//
// Jenis perpindahan:
//   pindah        -> pindah kelas di tahun ajaran & semester yang sama
//                    (baris aktif cukup diganti kelas_id-nya)
//   semester_baru -> naik kelas / pindah karena tahun ajaran / semester baru
//                    (baris aktif lama jadi status 0, dibuat baris baru)
//   lulus         -> tujuan kelas Alumni: baris aktif jadi status 0, dibuat baris
//                    Alumni (semester 0, status 0, ta = tahun lulus)
//   pindah_sekolah-> keluar karena pindah sekolah: baris aktif jadi status 0,
//                    tidak ada kelas baru, sekolah tujuan di keterangan
//   nonaktif      -> dikeluarkan dari kelas (keluar), status 0
const models = require("../../models");
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const KelasStudentModel = models.kelas_student;
const RiwayatModel = models.riwayat_kelas;
const { STATUS_PINDAH_SEKOLAH } = require("../../utils/statusAkun");
const { clearStatusCache } = require("../../middleware/jwtValidateMiddleware");

const includeKelasTa = [
  { model: models.kelas, as: "kelas", attributes: ["id", "nama_kelas"] },
  { model: models.ta, as: "tahun_ajaran", attributes: ["id", "nama_tahun_ajaran"] },
];

// GET /guru/siswa/kelas/ringkasan
// Semua kelas + jumlah siswa aktif + TA & semester yang paling banyak dipakai di kelas itu
async function ringkasanKelas(req, res) {
  try {
    const kelas = await models.kelas.findAll({
      attributes: ["id", "nama_kelas"],
      order: [["nama_kelas", "ASC"]],
      raw: true,
    });
    const stat = await sequelize.query(
      `SELECT ks.kelas_id, ks.ta_id, ks.semester, t.nama_tahun_ajaran, COUNT(*) AS jumlah
         FROM kelas_students ks
         LEFT JOIN ta t ON t.id = ks.ta_id
        WHERE ks.status = 1
        GROUP BY ks.kelas_id, ks.ta_id, ks.semester, t.nama_tahun_ajaran`,
      { type: QueryTypes.SELECT }
    );
    const data = kelas.map((k) => {
      const rows = stat.filter((s) => Number(s.kelas_id) === Number(k.id));
      const jumlah = rows.reduce((a, r) => a + Number(r.jumlah), 0);
      const utama = rows.sort((a, b) => Number(b.jumlah) - Number(a.jumlah))[0];
      return {
        ...k,
        jumlah_siswa: jumlah,
        ta_id: utama?.ta_id ?? null,
        nama_tahun_ajaran: utama?.nama_tahun_ajaran ?? null,
        semester: utama?.semester ?? null,
      };
    });
    return res.json({ status: "Success", data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// GET /guru/siswa/tanpa-kelas
// Siswa baru yang BELUM PERNAH punya kelas (tidak ada baris di kelas_students),
// kecuali akun yang berstatus pindah sekolah. Bentuk data disamakan dengan listAnggotaKelas.
async function listSiswaTanpaKelas(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT s.id AS student_id, s.nama_siswa, s.nis, s.nisn, s.angkatan, s.tahun_ajaran
         FROM students s
         LEFT JOIN users u ON u.id = s.user_id
        WHERE NOT EXISTS (SELECT 1 FROM kelas_students ks WHERE ks.student_id = s.id)
          AND (u.status IS NULL OR u.status <> :pindah)
        ORDER BY s.nama_siswa ASC`,
      { type: QueryTypes.SELECT, replacements: { pindah: STATUS_PINDAH_SEKOLAH } }
    );
    const data = rows.map((r) => ({
      id: `baru-${r.student_id}`,
      student_id: r.student_id,
      semester: null,
      ta_id: null,
      tahun_ajaran: null,
      siswa: {
        id: r.student_id,
        nama_siswa: r.nama_siswa,
        nis: r.nis,
        nisn: r.nisn,
        angkatan: r.angkatan,
        tahun_ajaran_masuk: r.tahun_ajaran,
      },
    }));
    return res.json({ status: "Success", data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// GET /guru/siswa/kelas/anggota?kelas_id=
async function listAnggotaKelas(req, res) {
  try {
    const kelas_id = Number(req.query.kelas_id);
    if (!kelas_id) {
      return res.status(422).json({ status: "fail", msg: "kelas_id wajib diisi" });
    }
    const rows = await KelasStudentModel.findAll({
      where: { kelas_id, status: 1 },
      include: [
        ...includeKelasTa,
        {
          model: models.student,
          as: "siswa",
          attributes: ["id", "nama_siswa", "nis", "nisn"],
        },
      ],
    });
    rows.sort((a, b) =>
      String(a.siswa?.nama_siswa || "").localeCompare(String(b.siswa?.nama_siswa || ""))
    );
    return res.json({ status: "Success", data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// POST /guru/siswa/kelas/pindah
// body: {
//   student_ids: number[], kelas_id,
//   semester_baru: boolean,
//   ta_id, semester   (wajib jika semester_baru = true)
//   keterangan?       (opsional)
// }
async function pindahKelas(req, res) {
  const { student_ids, kelas_id, ta_id, semester, keterangan } = req.body || {};
  const semesterBaru = req.body?.semester_baru === true || req.body?.semester_baru === "true";

  if (!Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(422).json({ status: "fail", msg: "Pilih minimal satu siswa" });
  }

  // Keluar karena pindah sekolah (tidak ada kelas tujuan)
  if (req.body?.pindah_sekolah === true || req.body?.pindah_sekolah === "true") {
    return pindahSekolah(req, res, {
      ids: [...new Set(student_ids.map(Number).filter(Boolean))],
      sekolah_tujuan: String(req.body?.sekolah_tujuan || "").trim(),
      keterangan,
    });
  }

  if (!kelas_id) {
    return res.status(422).json({ status: "fail", msg: "Kelas tujuan wajib dipilih" });
  }
  if (semesterBaru && (!ta_id || semester === undefined || semester === null || semester === "")) {
    return res.status(422).json({
      status: "fail",
      msg: "Tahun ajaran dan semester wajib diisi untuk semester baru",
    });
  }

  const ids = [...new Set(student_ids.map(Number).filter(Boolean))];

  try {
    const kelas = await models.kelas.findByPk(kelas_id);
    if (!kelas) {
      return res.status(422).json({ status: "fail", msg: "Kelas tujuan tidak ditemukan" });
    }

    // Tujuan kelas Alumni -> diproses sebagai kelulusan
    if (/alumni/i.test(kelas.nama_kelas || "")) {
      return luluskanSiswa(req, res, { ids, kelas, ta_id, keterangan });
    }

    if (semesterBaru) {
      const ta = await models.ta.findByPk(ta_id);
      if (!ta) {
        return res.status(422).json({ status: "fail", msg: "Tahun ajaran tidak ditemukan" });
      }
    }

    const userIdsDiaktifkan = [];
    const result = await sequelize.transaction(async (t) => {
      let dipindah = 0;
      const dilewati = [];

      for (const student_id of ids) {
        const siswa = await models.student.findByPk(student_id, {
          attributes: ["id", "nama_siswa"],
          transaction: t,
        });
        if (!siswa) {
          dilewati.push({ student_id, alasan: "Siswa tidak ditemukan" });
          continue;
        }

        const aktif = await KelasStudentModel.findOne({
          where: { student_id, status: 1 },
          order: [["id", "DESC"]],
          transaction: t,
        });

        if (!semesterBaru) {
          // Pindah di semester yang sama: butuh kelas aktif
          if (!aktif) {
            dilewati.push({
              student_id,
              nama_siswa: siswa.nama_siswa,
              alasan: "Tidak punya kelas aktif (gunakan opsi semester baru)",
            });
            continue;
          }
          if (Number(aktif.kelas_id) === Number(kelas_id)) {
            dilewati.push({
              student_id,
              nama_siswa: siswa.nama_siswa,
              alasan: "Sudah berada di kelas tujuan",
            });
            continue;
          }
          const dari_kelas_id = aktif.kelas_id;
          await aktif.update({ kelas_id }, { transaction: t });
          await RiwayatModel.create(
            {
              student_id,
              jenis: "pindah",
              dari_kelas_id,
              dari_ta_id: aktif.ta_id,
              dari_semester: aktif.semester,
              ke_kelas_id: kelas_id,
              ke_ta_id: aktif.ta_id,
              ke_semester: aktif.semester,
              keterangan: keterangan || null,
              created_by: req.id || null,
            },
            { transaction: t }
          );
          dipindah += 1;
          continue;
        }

        // Semester / tahun ajaran baru
        if (
          aktif &&
          Number(aktif.kelas_id) === Number(kelas_id) &&
          Number(aktif.ta_id) === Number(ta_id) &&
          Number(aktif.semester) === Number(semester)
        ) {
          dilewati.push({
            student_id,
            nama_siswa: siswa.nama_siswa,
            alasan: "Sudah berada di kelas, tahun ajaran & semester tujuan",
          });
          continue;
        }

        await KelasStudentModel.update(
          { status: 0 },
          { where: { student_id, status: 1 }, transaction: t }
        );
        await KelasStudentModel.create(
          { kelas_id, student_id, ta_id, semester, status: 1 },
          { transaction: t }
        );
        // Siswa yang dulu pindah sekolah lalu kembali: aktifkan lagi akunnya
        const siswaUser = await models.student.findByPk(student_id, {
          attributes: ["user_id"],
          transaction: t,
        });
        if (siswaUser?.user_id) {
          const [n] = await models.user.update(
            { status: "active" },
            {
              where: { id: siswaUser.user_id, status: STATUS_PINDAH_SEKOLAH },
              transaction: t,
            }
          );
          if (n > 0) userIdsDiaktifkan.push(siswaUser.user_id);
        }
        await RiwayatModel.create(
          {
            student_id,
            jenis: "semester_baru",
            dari_kelas_id: aktif?.kelas_id ?? null,
            dari_ta_id: aktif?.ta_id ?? null,
            dari_semester: aktif?.semester ?? null,
            ke_kelas_id: kelas_id,
            ke_ta_id: ta_id,
            ke_semester: semester,
            keterangan: keterangan || null,
            created_by: req.id || null,
          },
          { transaction: t }
        );
        dipindah += 1;
      }

      return { dipindah, dilewati };
    });

    clearStatusCache(userIdsDiaktifkan);

    return res.json({
      status: "Success",
      msg: `${result.dipindah} siswa berhasil dipindahkan ke ${kelas.nama_kelas}`,
      ...result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi kesalahan, tidak ada data yang diubah",
    });
  }
}

// Kelulusan: dipanggil dari pindahKelas bila kelas tujuan adalah Alumni.
// Mengikuti pola data alumni yang sudah ada: kelas Alumni, semester 0, status 0,
// ta_id = tahun ajaran kelulusan.
async function luluskanSiswa(req, res, { ids, kelas, ta_id, keterangan }) {
  if (!ta_id) {
    return res.status(422).json({
      status: "fail",
      msg: "Tahun ajaran kelulusan wajib diisi",
    });
  }
  const ta = await models.ta.findByPk(ta_id);
  if (!ta) {
    return res.status(422).json({ status: "fail", msg: "Tahun ajaran tidak ditemukan" });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      let dipindah = 0;
      const dilewati = [];

      for (const student_id of ids) {
        const siswa = await models.student.findByPk(student_id, {
          attributes: ["id", "nama_siswa"],
          transaction: t,
        });
        if (!siswa) {
          dilewati.push({ student_id, alasan: "Siswa tidak ditemukan" });
          continue;
        }
        const aktif = await KelasStudentModel.findOne({
          where: { student_id, status: 1 },
          order: [["id", "DESC"]],
          transaction: t,
        });
        if (!aktif) {
          dilewati.push({
            student_id,
            nama_siswa: siswa.nama_siswa,
            alasan: "Tidak punya kelas aktif",
          });
          continue;
        }

        await KelasStudentModel.update(
          { status: 0 },
          { where: { student_id, status: 1 }, transaction: t }
        );
        await KelasStudentModel.create(
          { kelas_id: kelas.id, student_id, ta_id, semester: 0, status: 0 },
          { transaction: t }
        );
        await RiwayatModel.create(
          {
            student_id,
            jenis: "lulus",
            dari_kelas_id: aktif.kelas_id,
            dari_ta_id: aktif.ta_id,
            dari_semester: aktif.semester,
            ke_kelas_id: kelas.id,
            ke_ta_id: ta_id,
            ke_semester: 0,
            keterangan: keterangan || null,
            created_by: req.id || null,
          },
          { transaction: t }
        );
        dipindah += 1;
      }
      return { dipindah, dilewati };
    });

    return res.json({
      status: "Success",
      msg: `${result.dipindah} siswa berhasil diluluskan (Alumni ${ta.nama_tahun_ajaran})`,
      ...result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi kesalahan, tidak ada data yang diubah",
    });
  }
}

// Pindah sekolah: kelas aktif dinonaktifkan, tidak dibuat kelas baru.
// Sekolah tujuan disimpan di keterangan riwayat.
async function pindahSekolah(req, res, { ids, sekolah_tujuan, keterangan }) {
  if (!sekolah_tujuan) {
    return res.status(422).json({ status: "fail", msg: "Nama sekolah tujuan wajib diisi" });
  }
  const ket = `Pindah ke ${sekolah_tujuan}${keterangan ? `. ${keterangan}` : ""}`.slice(0, 255);

  try {
    const userIdsDiblokir = [];
    const result = await sequelize.transaction(async (t) => {
      let dipindah = 0;
      const dilewati = [];
      for (const student_id of ids) {
        const siswa = await models.student.findByPk(student_id, {
          attributes: ["id", "nama_siswa", "user_id"],
          transaction: t,
        });
        if (!siswa) {
          dilewati.push({ student_id, alasan: "Siswa tidak ditemukan" });
          continue;
        }
        const aktif = await KelasStudentModel.findOne({
          where: { student_id, status: 1 },
          order: [["id", "DESC"]],
          transaction: t,
        });
        if (!aktif) {
          dilewati.push({
            student_id,
            nama_siswa: siswa.nama_siswa,
            alasan: "Tidak punya kelas aktif",
          });
          continue;
        }
        await KelasStudentModel.update(
          { status: 0 },
          { where: { student_id, status: 1 }, transaction: t }
        );
        await RiwayatModel.create(
          {
            student_id,
            jenis: "pindah_sekolah",
            dari_kelas_id: aktif.kelas_id,
            dari_ta_id: aktif.ta_id,
            dari_semester: aktif.semester,
            keterangan: ket,
            created_by: req.id || null,
          },
          { transaction: t }
        );
        // Akun login siswa dinonaktifkan (alumni tidak, hanya pindah sekolah)
        if (siswa.user_id) {
          await models.user.update(
            { status: STATUS_PINDAH_SEKOLAH },
            { where: { id: siswa.user_id }, transaction: t }
          );
          userIdsDiblokir.push(siswa.user_id);
        }
        dipindah += 1;
      }
      return { dipindah, dilewati };
    });

    // Berlaku segera untuk token yang sudah login
    clearStatusCache(userIdsDiblokir);

    return res.json({
      status: "Success",
      msg: `${result.dipindah} siswa dicatat pindah sekolah ke ${sekolah_tujuan}. Akun login siswa telah dinonaktifkan.`,
      ...result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi kesalahan, tidak ada data yang diubah",
    });
  }
}

// PUT /guru/siswa/kelas/nonaktif
// body: { ids: number[] (id baris kelas_students), keterangan? }
async function nonaktifkanSiswaKelas(req, res) {
  const raw = req.body?.ids;
  const ids = Array.isArray(raw) ? [...new Set(raw.map(Number).filter(Boolean))] : [];
  if (ids.length === 0) {
    return res.status(422).json({ status: "fail", msg: "Pilih minimal satu siswa" });
  }
  try {
    const jumlah = await sequelize.transaction(async (t) => {
      const rows = await KelasStudentModel.findAll({
        where: { id: ids, status: 1 },
        transaction: t,
      });
      for (const r of rows) {
        await r.update({ status: 0 }, { transaction: t });
        await RiwayatModel.create(
          {
            student_id: r.student_id,
            jenis: "nonaktif",
            dari_kelas_id: r.kelas_id,
            dari_ta_id: r.ta_id,
            dari_semester: r.semester,
            keterangan: req.body?.keterangan || null,
            created_by: req.id || null,
          },
          { transaction: t }
        );
      }
      return rows.length;
    });
    return res.json({
      status: "Success",
      msg: `${jumlah} siswa berhasil dinonaktifkan dari kelas`,
      dinonaktifkan: jumlah,
      dilewati: ids.length - jumlah,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// GET /guru/siswa/kelas/riwayat/:student_id
async function riwayatKelas(req, res) {
  try {
    const { student_id } = req.params;
    const siswa = await models.student.findByPk(student_id, {
      attributes: ["id", "nama_siswa", "nis", "nisn"],
    });
    if (!siswa) {
      return res.status(404).json({ status: "fail", msg: "Siswa tidak ditemukan" });
    }
    const [riwayat, rombel] = await Promise.all([
      RiwayatModel.findAll({
        where: { student_id },
        include: [
          { model: models.kelas, as: "dari_kelas", attributes: ["id", "nama_kelas"] },
          { model: models.kelas, as: "ke_kelas", attributes: ["id", "nama_kelas"] },
          { model: models.ta, as: "dari_ta", attributes: ["id", "nama_tahun_ajaran"] },
          { model: models.ta, as: "ke_ta", attributes: ["id", "nama_tahun_ajaran"] },
          { model: models.user, as: "oleh", attributes: ["id", "name"] },
        ],
        order: [["id", "DESC"]],
      }),
      KelasStudentModel.findAll({
        where: { student_id },
        include: includeKelasTa,
        // urut berdasarkan nama tahun ajaran (id TA tidak selalu kronologis)
        order: [
          [{ model: models.ta, as: "tahun_ajaran" }, "nama_tahun_ajaran", "DESC"],
          ["semester", "DESC"],
          ["id", "DESC"],
        ],
      }),
    ]);
    return res.json({ status: "Success", siswa, riwayat, data: rombel });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

// GET /guru/siswa/alumni?ta_id=&keyword=&page=&pageSize=
// Alumni = baris rombel di kelas "Alumni" (status 0). ta_id = tahun lulus.
async function listAlumni(req, res) {
  try {
    const { Op } = require("sequelize");
    const { ta_id, keyword } = req.query;
    const limit = Number(req.query.pageSize) || 10;
    const offset = Number(req.query.page) || 0;

    const kelasAlumni = await models.kelas.findAll({
      attributes: ["id"],
      where: { nama_kelas: { [Op.substring]: "alumni" } },
      raw: true,
    });
    const alumniIds = kelasAlumni.map((k) => k.id);
    if (alumniIds.length === 0) {
      return res.json({ status: "Success", data: { count: 0, rows: [] }, ringkasan: [] });
    }

    const kw = String(keyword || "").trim();
    const where = {
      kelas_id: alumniIds,
      ...(ta_id && { ta_id: Number(ta_id) }),
    };

    const data = await KelasStudentModel.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [
        [{ model: models.ta, as: "tahun_ajaran" }, "nama_tahun_ajaran", "DESC"],
        [{ model: models.student, as: "siswa" }, "nama_siswa", "ASC"],
      ],
      include: [
        { model: models.ta, as: "tahun_ajaran", attributes: ["id", "nama_tahun_ajaran"] },
        {
          model: models.student,
          as: "siswa",
          required: true,
          attributes: ["id", "nama_siswa", "nis", "nisn", "angkatan", "jenis_kelamin"],
          where: kw
            ? {
                [Op.or]: [
                  { nama_siswa: { [Op.substring]: kw } },
                  { nis: { [Op.substring]: kw } },
                  { nisn: { [Op.substring]: kw } },
                ],
              }
            : undefined,
          include: [{ model: models.user, as: "user", attributes: ["id", "email"] }],
        },
      ],
    });

    const ringkasan = await sequelize.query(
      `SELECT ks.ta_id, t.nama_tahun_ajaran, COUNT(*) AS jumlah
         FROM kelas_students ks
         LEFT JOIN ta t ON t.id = ks.ta_id
        WHERE ks.kelas_id IN (:ids)
        GROUP BY ks.ta_id, t.nama_tahun_ajaran
        ORDER BY t.nama_tahun_ajaran DESC`,
      { type: QueryTypes.SELECT, replacements: { ids: alumniIds } }
    );

    return res.json({ status: "Success", page: req.page, pageSize: limit, data, ringkasan });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = {
  listSiswaTanpaKelas,
  listAlumni,
  ringkasanKelas,
  listAnggotaKelas,
  pindahKelas,
  riwayatKelas,
  nonaktifkanSiswaKelas,
};

const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const {
  checkQuery,
  calculateMinutesDifference,
} = require("../../utils/format");
const { RESPONSE_API } = require("../../utils/response");
const { isBenar, parseJSON, TIPE_MANUAL } = require("../../utils/penilaianUjian");
const { ujianMilik, bolehKelola } = require("../../utils/aksesUjian");

// Durasi (menit) tidak boleh melebihi rentang waktu_mulai..waktu_selesai
function validasiWaktuUjian(p) {
  if (!p) return null;
  const mulai = new Date(p.waktu_mulai);
  const selesai = new Date(p.waktu_selesai);
  if (p.waktu_mulai && p.waktu_selesai) {
    if (isNaN(mulai) || isNaN(selesai)) return "Waktu mulai/selesai tidak valid";
    if (selesai <= mulai) return "Waktu selesai harus setelah waktu mulai";
    const rentang = Math.floor((selesai - mulai) / 60000);
    if (p.durasi !== undefined && Number(p.durasi) > rentang) {
      return `Durasi (${p.durasi} menit) melebihi rentang waktu ujian (${rentang} menit)`;
    }
  }
  if (p.durasi !== undefined && (!Number.isFinite(Number(p.durasi)) || Number(p.durasi) <= 0)) {
    return "Durasi harus lebih dari 0 menit";
  }
  return null;
}

const response = new RESPONSE_API();

// Membuka ujian: status draft -> open, buat 1 baris nilai per siswa aktif.
// Data diambil dari baris ujian (bukan body), idempoten, dalam transaksi.
const createPenilaian = async (req, res) => {
  try {
    const ujian = await ujianMilik(req, req.body.id);
    if (!ujian) {
      return res.status(403).json({ status: "Fail", msg: "Ujian tidak ditemukan atau milik guru lain" });
    }
    if (ujian.status !== "draft") {
      return res.status(422).json({ status: "Fail", msg: "Ujian sudah dibuka sebelumnya" });
    }

    // Hanya siswa yang AKTIF di kelas ujian (status 0 = riwayat/pindah/alumni)
    let student = await StudentModel.findAll({
      where: { kelas_id: ujian.kelas_id, status: 1 },
    });
    // student_access (opsional): bila berisi daftar id siswa, hanya siswa tersebut
    const akses = parseJSON(ujian.student_access, []).map(Number).filter(Boolean);
    if (akses.length) student = student.filter((s) => akses.includes(Number(s.student_id)));

    if (student.length === 0) {
      return res.status(422).json({ status: "Fail", msg: "Kelas ini tidak memiliki siswa" });
    }

    const dibuat = await models.sequelize.transaction(async (t) => {
      // kunci baris ujian & pastikan masih draft (cegah klik ganda)
      const [jumlah] = await UjianController.update(
        { status: "open" },
        { where: { id: ujian.id, status: "draft" }, transaction: t }
      );
      if (jumlah === 0) return null;

      const sudahAda = new Set(
        (
          await NilaiController.findAll({
            where: { ujian_id: ujian.id },
            attributes: ["student_id"],
            transaction: t,
          })
        ).map((r) => Number(r.student_id))
      );

      const baris = student
        .filter((s) => !sudahAda.has(Number(s.student_id)))
        .map((s) => ({
          ujian_id: ujian.id,
          mapel_id: ujian.mapel_id,
          kelas_id: ujian.kelas_id,
          jenis_ujian: ujian.jenis_ujian,
          urutan: Number(ujian.is_hirarki) === 1 ? ujian.urutan : 0,
          exam_result: 0,
          teacher_id: ujian.teacher_id,
          student_id: s.student_id,
          waktu_tersisa: ujian.durasi,
          ta_id: ujian.ta_id,
          status: "open",
        }));
      if (baris.length) await NilaiController.bulkCreate(baris, { transaction: t });
      return baris.length;
    });

    if (dibuat === null) {
      return res.status(422).json({ status: "Fail", msg: "Ujian sudah dibuka sebelumnya" });
    }

    return res.status(201).json({
      status: "Success",
      msg: `Berhasil membuka ujian untuk ${dibuat} siswa`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "Fail", msg: "Terjadi Kesalahan" });
  }
};

const createUjian = async (req, res) => {
  try {
    const payload = req.body.payload[0];

    const errWaktu = validasiWaktuUjian(payload);
    if (errWaktu) {
      return res.status(422).json({ status: "Fail", msg: errWaktu });
    }

    await UjianController.create({
      ...payload,
      status: "draft",
      soal: JSON.stringify(payload.soal),
      student_access: JSON.stringify(payload.student_access),
      teacher_id: req.teacher_id,
    });

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil membuat soal ujian",
      // msg: `Berhasil upload ${success} soal dari ${total} soal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const listUjian = async (req, res) => {
  let = {
    mapel_id,
    is_all,
    kelas_id,
    ta_id,
    teacher_id,
    jenis_ujian,
    page,
    pageSize,
  } = req.query;

  try {
    const soals = await UjianController.findAndCountAll({
      // attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
      where: {
        ...(checkQuery(jenis_ujian) && {
          jenis_ujian: jenis_ujian,
        }),
        ...(checkQuery(mapel_id) && {
          mapel_id: mapel_id,
        }),
        ...(checkQuery(teacher_id) && {
          teacher_id: teacher_id,
        }),
        ...(checkQuery(kelas_id) && {
          kelas_id: kelas_id,
        }),

        ...(checkQuery(ta_id) && {
          ta_id: ta_id,
        }),

        ...(parseInt(is_all) === 1 && {
          teacher_id: req.teacher_id,
        }),
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      limit: pageSize,
      offset: page,
      order: [["id", "desc"]],
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: soals,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};


const listUjianBerjalan = async (req, res) => {
  let {
    mapel_id,
    is_all,
    kelas_id,
    ta_id,
    teacher_id,
    jenis_ujian,
    page,
    pageSize,
  } = req.query;
  const now = new Date();
  now.setHours(now.getHours() + 7); // Tambah 7 jam

  try {
    const ujianBerjalan = await UjianController.findAndCountAll({
      where: {
        waktu_mulai: { [Op.lte]: now }, // Waktu mulai kurang dari atau sama dengan sekarang
        waktu_selesai: { [Op.gte]: now }, // Waktu selesai lebih dari atau sama dengan sekarang
       
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      limit: pageSize,
      offset: page,
      order: [["id", "desc"]],
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      now : now,
      page: req.page,
      pageSize: pageSize,
      data: ujianBerjalan,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};


const listUjianHari = async (req, res) => {
  let {
    mapel_id,
    is_all,
    kelas_id,
    ta_id,
    teacher_id,
    jenis_ujian,
    page,
    pageSize,
  } = req.query;
  
  // Dapatkan waktu sekarang dalam UTC
  const nowUTC = new Date();
  
  // Konversi ke WIB (UTC+7)
  const nowWIB = new Date(nowUTC);
  nowWIB.setHours(nowWIB.getHours() + 7);
  
  // Dapatkan tanggal hari ini dalam WIB
  const todayWIB = new Date(nowWIB);
  todayWIB.setHours(0, 0, 0, 0); // Set ke awal hari (00:00:00 WIB)
  
  const tomorrowWIB = new Date(todayWIB);
  tomorrowWIB.setDate(tomorrowWIB.getDate() + 1); // Hari berikutnya di WIB

  try {
    const ujianBerjalan = await UjianController.findAndCountAll({
      where: {
        waktu_mulai: { 
          [Op.gte]: todayWIB, // Waktu mulai lebih dari atau sama dengan hari ini WIB
          [Op.lt]: tomorrowWIB // Kurang dari besok WIB (artinya masih hari ini)
        },
        waktu_selesai: { [Op.gte]: nowWIB }, // Waktu selesai lebih dari atau sama dengan sekarang WIB
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      limit: pageSize,
      offset: page,
      order: [["id", "desc"]],
    });
    
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      nowUTC: nowUTC, // Waktu server UTC
      nowWIB: nowWIB, // Waktu WIB (UTC+7)
      todayWIB: todayWIB, // Hari ini di WIB
      page: req.page,
      pageSize: pageSize,
      data: ujianBerjalan,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const detailUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const ujian = await ujianMilik(req, id);
    if (!ujian) {
      return res.status(403).json({ status: "Fail", msg: "Ujian tidak ditemukan atau milik guru lain" });
    }

    let soal = await BankSoalController.findAll({
      where: {
        id: {
          [Op.in]: parseJSON(ujian.soal, []),
        },
      },
    });

    ujian.soal = JSON.stringify(soal);

    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",

      detail_ujian: ujian,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const updateUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const payload = req.body.payload[0];
    const ujian = await UjianController.findOne({
      where: {
        id: id,
      },
    });

    if (ujian === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "ujian tidak Ditemukan",
      });
    }

    if (!bolehKelola(req, ujian.teacher_id)) {
      return res.status(403).json({ status: "Fail", msg: "Ujian ini milik guru lain" });
    }

    const errWaktu = validasiWaktuUjian({
      waktu_mulai: payload.waktu_mulai ?? ujian.waktu_mulai,
      waktu_selesai: payload.waktu_selesai ?? ujian.waktu_selesai,
      durasi: payload.durasi ?? ujian.durasi,
    });
    if (errWaktu) {
      return res.status(422).json({ status: "Fail", msg: errWaktu });
    }

    if (ujian.status === "open") {
      await UjianController.update(
        {
          jenis_ujian: payload.jenis_ujian,
          waktu_mulai: payload.waktu_mulai,
          waktu_selesai: payload.waktu_selesai,
        },
        {
          where: {
            id,
          },
        }
      );

      return res.status(200).json({
        status: "success",
        msg: "Perbaharui Berhasil",
      });
    }
    // status tidak boleh diubah lewat payload (membuka ujian hanya lewat createPenilaian)
    const { status: _abaikan, id: _id, teacher_id: _t, ...data } = payload;

    await UjianController.update(
      {
        ...data,
        soal: JSON.stringify(payload.soal),
        student_access: JSON.stringify(payload.student_access),
        teacher_id: ujian.teacher_id,
      },
      {
        where: {
          id,
        },
      }
    );
    return res.json({
      status: "Success",
      msg: "Update Success",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const deleteUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const ujian = await UjianController.findOne({
      where: {
        id: id,
        teacher_id: req.teacher_id,
      },
    });

    if (ujian === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "Ujian ini milik guru lain",
      });
    }
    if (ujian.teacher_id !== req.teacher_id) {
      return res.status(422).json({
        status: "Fail",
        msg: "Soal ini milik guru lain",
      });
    }

    await NilaiController.destroy({
      where: {
        ujian_id: ujian.id,
      },
    });
    await UjianController.destroy({
      where: {
        id: ujian.id,
      },
    });

    return res.status(200).json({
      status: "Success",
      msg: `Delete Success`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const AnalisislUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const ujian = await ujianMilik(req, id);
    if (!ujian) {
      return res.status(403).json({ status: "Fail", msg: "Ujian tidak ditemukan atau milik guru lain" });
    }

    let soal = await BankSoalController.findAll({
      where: {
        id: {
          [Op.in]: parseJSON(ujian.soal, []),
        },
      },
    });

    const jawaban = await NilaiController.findAll({
      attributes: ["student_id", "jawaban"],
      where: {
        ujian_id: id,
      },
    });

    const jawabanJSON = jawaban.map((item) => {
      return {
        student_id: item.student_id,
        jawaban: parseJSON(item.jawaban, []),
      };
    });
    ujian.soal = JSON.stringify(soal);

    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      soal: soal,

      analisis: analyzeAnswers({ soal: soal, siswa: jawabanJSON }),
      // soal : soal,
      // siswa : jawabanJSON
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const cekUrutan = response.requestResponse(async (req, res) => {
  const nilai = await UjianController.max("urutan", {
    where: {
      mapel_id: req.body.mapel_id,
      kelas_id: req.body.kelas_id,
      ta_id: req.body.ta_id,
      is_hirarki: 1,
    },
  });

  return {
    msg: "Urutan ujian ditemukan",
    data: nilai,
  };
});

module.exports = {
  createUjian,
  listUjian,
  detailUjian,
  updateUjian,
  deleteUjian,
  createPenilaian,
  AnalisislUjian,
  cekUrutan,
   listUjianBerjalan,
   listUjianHari
};

const analyzeAnswers = (data) => {
  const totalSiswa = data.siswa.length;
  const persen = (n, d) => (d > 0 ? (n / d) * 100 : 0);

  return data.soal.map((soal) => {
    const results = {
      id: soal.id,
      materi: soal.materi,
      tipe: soal.tipe,
      benar: 0,
      salah: 0,
      tidakMenjawab: 0,
      pilihan: {},
    };

    if (soal.tipe === "PG") {
      const choices = parseJSON(soal.soal, {});
      ["a", "b", "c", "d", "e"].forEach((choice) => {
        if (choices[choice]) results.pilihan[choice] = 0;
      });
    }

    data.siswa.forEach((siswa) => {
      const list = Array.isArray(siswa.jawaban) ? siswa.jawaban : [];
      // satu jawaban per soal (entri terakhir), konsisten dengan penilaian
      const jawabanSiswa = [...list].reverse().find((j) => Number(j?.id) === Number(soal.id));
      const isi = jawabanSiswa?.jawaban;
      const kosong =
        isi === undefined || isi === null || isi === "" || (Array.isArray(isi) && isi.length === 0);

      if (!jawabanSiswa || kosong) {
        results.tidakMenjawab++;
        return;
      }

      if (TIPE_MANUAL.includes(soal.tipe)) {
        // essay/LV: "benar" bila guru memberi poin penuh
        const p = Number(jawabanSiswa.point);
        if (Number.isFinite(p) && p >= Number(soal.point)) results.benar++;
        else results.salah++;
      } else if (isBenar(soal.tipe, isi, soal.jawaban)) {
        results.benar++;
      } else {
        results.salah++;
      }

      if (soal.tipe === "PG") {
        const pil = String(isi).toLowerCase();
        if (results.pilihan[pil] !== undefined) results.pilihan[pil]++;
      }
    });

    const dijawab = totalSiswa - results.tidakMenjawab;
    results.persentaseBenar = persen(results.benar, totalSiswa);
    results.persentaseSalah = persen(results.salah, dijawab);
    results.persentaseTidakMenjawab = persen(results.tidakMenjawab, totalSiswa);

    if (soal.tipe === "PG") {
      for (const choice in results.pilihan) {
        results.pilihan[choice] = {
          count: results.pilihan[choice],
          persentase: persen(results.pilihan[choice], totalSiswa),
        };
      }
    }

    return results;
  });
};

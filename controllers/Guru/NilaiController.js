const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const { checkQuery } = require("../../utils/format");
const { RESPONSE_API } = require("../../utils/response");
const { hitungNilai, parseJSON, KKM } = require("../../utils/penilaianUjian");
const {
  bolehKelola,
  ujianMilik,
  saringNilaiMilik,
  TIDAK_BERHAK,
} = require("../../utils/aksesUjian");

const response = new RESPONSE_API();

// Nilai akhir (exam_result) & kelulusan. is_lulus dihitung di server dari KKM.
const submitExamResult = response.requestResponse(async (req, res) => {
  const payload = Array.isArray(req.body) ? req.body : [];
  const izin = new Set(await saringNilaiMilik(req, payload.map((p) => p?.id)));

  let diubah = 0;
  const ditolak = [];
  for (const item of payload) {
    const id = Number(item?.id);
    if (!izin.has(id)) {
      ditolak.push({ id, alasan: "Bukan ujian milik Anda" });
      continue;
    }
    const nilai = Number(item.exam_result);
    if (item.exam_result === "" || item.exam_result === null || !Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
      ditolak.push({ id, alasan: "Nilai harus angka 0-100" });
      continue;
    }
    await NilaiController.update(
      {
        exam_result: nilai,
        is_lulus: nilai >= KKM ? 1 : 0,
        status: "finish",
      },
      { where: { id } }
    );
    diubah += 1;
  }

  if (diubah === 0 && ditolak.length) {
    return {
      statusCode: 422,
      msg: `Tidak ada nilai yang disimpan: ${ditolak[0].alasan}`,
      ditolak,
    };
  }
  return {
    msg: ditolak.length ? `${diubah} nilai tersimpan, ${ditolak.length} ditolak` : "Berhasil",
    diubah,
    ditolak,
  };
});

// Penilaian ulang oleh guru (memberi poin essay/LV). Memakai logika penilaian yang sama
// dengan submit siswa agar hasil MP/MTF konsisten; poin manual dibatasi 0..poin soal.
const updateLastExam = response.requestResponse(async (req, res) => {
  const { student_id, id, jawaban } = req.body;
  const exam = await NilaiController.findOne({
    where: { id: id, student_id: student_id },
    include: [
      { model: models.ujian, require: true, as: "ujian", attributes: ["status", "soal", "teacher_id"] },
    ],
  });

  if (!exam || !exam.ujian) {
    return { statusCode: 422, msg: "Data nilai tidak ditemukan" };
  }
  if (!bolehKelola(req, exam.ujian.teacher_id)) {
    return TIDAK_BERHAK;
  }
  if (exam.status !== "finish") {
    return { statusCode: 422, msg: "Ujian belum berakhir" };
  }

  const soal = await BankSoalController.findAll({
    attributes: ["id", "tipe", "jawaban", "point"],
    where: { id: { [Op.in]: parseJSON(exam.ujian.soal, []) } },
  });

  const hasil = hitungNilai(soal, jawaban, { pakaiPoinManual: true });

  let riwayat = parseJSON(exam.exam, []);
  if (riwayat.length) riwayat[riwayat.length - 1] = hasil.nilai;
  else riwayat = [hasil.nilai];

  await NilaiController.update(
    {
      keterangan: hasil.keterangan,
      exam: JSON.stringify(riwayat),
      status: "finish",
      remidial_count: 0,
      jawaban: JSON.stringify(hasil.jawaban),
    },
    { where: { id: exam.id } }
  );

  return {
    msg: "Jawaban berhasil tersimpan",
    nilai: hasil.nilai,
    keterangan: hasil.keterangan,
    total_point: hasil.total_point,
    point_siswa: hasil.point_siswa,
  };
});

// Soal + kunci jawaban ujian: hanya untuk pemilik ujian / pengelola
const getSoal = response.requestResponse(async (req, res) => {
  const exam = await ujianMilik(req, req.params.id, { attributes: ["soal", "teacher_id"] });
  if (!exam) return TIDAK_BERHAK;

  const soal = await BankSoalController.findAll({
    where: { id: { [Op.in]: parseJSON(exam.soal, []) } },
  });
  return { status: "Success", msg: "Soal ditemukan", soal };
});

const remidial = response.requestResponse(async (req, res) => {
  const ids = await saringNilaiMilik(req, req.body?.payload);
  if (!ids.length) return TIDAK_BERHAK;

  await NilaiController.update(
    { remidial_count: 1, status: "open" },
    { where: { id: { [Op.in]: ids } } }
  );

  return { status: "Success", msg: "Daftar remidial berhasil di perbaharui" };
});

const refreshCount = response.requestResponse(async (req, res) => {
  const ids = await saringNilaiMilik(req, req.body?.payload);
  if (!ids.length) return TIDAK_BERHAK;

  await NilaiController.update(
    { refresh_count: 3 },
    { where: { id: { [Op.in]: ids } } }
  );

  return { status: "Success", msg: "Siswa sudah bisa ujian kembali" };
});

const listPenilaianByTeacher = response.requestResponse(async (req, res) => {
  const { mapel_id, ujian_id, page, pageSize } = req.query;

  const ujian = await ujianMilik(req, ujian_id, { attributes: ["id", "teacher_id"] });
  if (!ujian) return TIDAK_BERHAK;

  const soals = await NilaiController.findAll({
    where: {
      ujian_id: ujian.id,
      ...(checkQuery(mapel_id) && { mapel_id: mapel_id }),
    },
    include: [
      { model: models.student, require: true, as: "siswa", attributes: ["id", "nama_siswa"] },
      {
        model: models.ujian,
        require: true,
        as: "ujian",
        attributes: ["id", "jenis_ujian", "tipe_ujian", "waktu_mulai", "waktu_selesai", "status", "durasi"],
      },
    ],
    order: [[{ model: models.student, as: "siswa" }, "nama_siswa", "ASC"]],
    ...(pageSize && { limit: Number(pageSize), offset: Number(page) || 0 }),
  });
  return {
    msg: "Berhasil ditemukan",
    page: req.page,
    pageSize: pageSize,
    data: soals,
  };
});

const listNotificationExam = response.requestResponse(async (req, res) => {
  const { page, pageSize } = req.query;
  const { fn, col } = require("sequelize");
  const alias = NilaiController.name;

  // Kompatibel dengan sql_mode ONLY_FULL_GROUP_BY: hanya kolom yang di-GROUP BY (+ agregat).
  // Dikelompokkan per ujian (FE membuat tautan penilaian dari ujian_id).
  const soals = await NilaiController.findAll({
    attributes: [
      [fn("MIN", col(`${alias}.id`)), "id"],
      "ujian_id",
      "jenis_ujian",
      "teacher_id",
      "mapel_id",
      "ta_id",
      "kelas_id",
      [fn("COUNT", col(`${alias}.id`)), "jumlah"],
    ],
    // Belum dinilai = sudah dikumpulkan siswa (finish) tetapi nilai akhir masih kosong/0
    where: {
      teacher_id: req.teacher_id,
      status: "finish",
      [Op.or]: [{ exam_result: null }, { exam_result: 0 }],
    },
    include: [
      {
        model: models.mapel,
        require: true,
        as: "mapel",
        attributes: ["id", "nama_mapel"],
      },
      {
        model: models.kelas,
        require: true,
        as: "kelas",
        attributes: ["id", "nama_kelas"],
      },
     
    ],
    ...(pageSize && { limit: Number(pageSize), offset: Number(page) || 0 }),
    group: ["ujian_id", "jenis_ujian", "teacher_id", "mapel_id", "ta_id", "kelas_id"],
  });
  return {
    msg: "Berhasil ditemukan",
    page: req.page,
    pageSize: pageSize,
    data: soals,
  };
});

module.exports = {
  listPenilaianByTeacher,
  remidial,
  refreshCount,
  getSoal,
  updateLastExam,
  submitExamResult,
  listNotificationExam
};

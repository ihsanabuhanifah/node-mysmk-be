const studentModel = require("../../models").student;
const mapelModel = require("../../models").mapel;
const Sequelize = require("sequelize");
const models = require("../../models");
const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const { RESPONSE_API } = require("../../utils/response");

const {
  calculateMinutesDifference,
  calculateWaktuSelesai,
  checkQuery,
} = require("../../utils/format");
const NilaiController = require("../../models").nilai;
const { hitungNilai, normalisasiJawaban, parseJSON } = require("../../utils/penilaianUjian");
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;

const response = new RESPONSE_API();

const getExam = response.requestResponse(async (req, res) => {
  let { page, pageSize, status, nama_mapel, judul_ujian } = req.query;

  const exam = await NilaiController.findAndCountAll({
    ...(pageSize !== undefined && { limit: pageSize }),
    ...(page !== undefined && { offset: page }),
    where: {
      status: {
        [Op.ne]: "finish", // Menggunakan Op.ne (not equal) untuk mengecualikan status "finish"
      },

      student_id: req.student_id,
    },
    attributes: {
      exclude: ["jawaban", "urutan"],
    },
    include: [
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
      },
      {
        model: mapelModel,
        as: "mapel",
        where: {
          ...(checkQuery(nama_mapel) && {
            nama_mapel: nama_mapel,
          }),
        },
        attributes: {
          exclude: "mapel_id",
          include: "id",
        },
      },
      {
        model: models.ujian,
        where: {
          ...(checkQuery(judul_ujian) && {
            judul_ujian: {
              [Op.substring]: judul_ujian,
            },
          }),
        },
        require: true,
        as: "ujian",
        attributes: [
          "id",
          "jenis_ujian",
          "tipe_ujian",
          "waktu_mulai",
          "waktu_selesai",
          "status",
          "durasi",
          "judul_ujian",
          "is_hirarki",
          "urutan",
        ],
        include: [
          {
            model: models.mapel,
            require: true,
            as: "mapel",
            attributes: ["id", "nama_mapel"],
          },
        ],
        order: [["urutan", "asc"]],
      },
    ],
    order: [["id", "desc"]],
    limit: pageSize,
    offset: page,
  });

  return {
    msg: "Data Ujian berhasil ditemukan",
    data: exam,
    limit: pageSize,
    offset: page,

    page: req.page,
    pageSize: pageSize,
  };
});

// ===== Waktu =====
// waktu_mulai/waktu_selesai ujian disimpan sebagai jam dinding WIB (berlabel UTC),
// sedangkan jam_mulai/jam_selesai siswa disimpan sebagai waktu nyata (UTC).
const WIB_MS = 7 * 60 * 60 * 1000;
const GRACE_SUBMIT_MS = 2 * 60 * 1000; // toleransi jaringan saat submit
const ujianKeWaktuNyata = (tgl) => new Date(new Date(tgl).getTime() - WIB_MS);

const takeExam = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const exam = await NilaiController.findOne({
    where: {
      id: id,
      student_id: req.student_id,
    },
    include: [
      {
        model: models.ujian,
        require: true,
        as: "ujian",
        attributes: [
          "id",
          "jenis_ujian",
          "tipe_ujian",
          "waktu_mulai",
          "waktu_selesai",
          "status",
          "soal",
          "durasi",
          "is_hirarki",
        ],
      },
    ],
  });

  if (!exam || !exam.ujian) {
    return { statusCode: 422, msg: "Ujian tidak ditemukan" };
  }

  if (exam.status === "finish") {
    return { statusCode: 422, msg: "Ujian telah berakhir" };
  }

  // Ujian berhierarki: wajib lulus ujian urutan sebelumnya
  if (Number(exam.ujian.is_hirarki) === 1 && Number(exam.urutan) > 1) {
    const cek = await NilaiController.findOne({
      where: {
        mapel_id: exam.mapel_id,
        kelas_id: exam.kelas_id,
        ta_id: exam.ta_id,
        student_id: req.student_id,
        urutan: { [Op.lt]: exam.urutan, [Op.gt]: 0 },
      },
      include: [
        { model: models.ujian, require: true, as: "ujian", attributes: ["judul_ujian"] },
      ],
      order: [["urutan", "DESC"]],
    });

    if (cek && Number(cek.is_lulus) !== 1) {
      return {
        statusCode: 422,
        msg: `Anda belum lulus pada exam ${cek.ujian?.judul_ujian || "sebelumnya"} di mata pelajaran ini`,
      };
    }
  }

  if (
    exam.refresh_count <= 0 &&
    exam.status === "progress" &&
    exam.ujian.tipe_ujian === "closed"
  ) {
    return {
      statusCode: 422,
      msg: "Anda tidak dapat mengambil ujian ini , Silahkan  menghubungi pengawas",
    };
  }

  const nowNyata = new Date();
  const now = new Date(nowNyata.getTime() + WIB_MS); // dibandingkan dengan jam dinding WIB
  const startTime = new Date(exam.ujian.waktu_mulai);
  const endTime = new Date(exam.ujian.waktu_selesai);
  const isRemidial = Number(exam.remidial_count) === 1;
  const dalamJendela = now >= startTime && now <= endTime;

  if (!(dalamJendela || exam.status === "progress" || isRemidial)) {
    return {
      statusCode: 422,
      msg: now < startTime ? "Waktu Ujian belum dimulai" : "Waktu Ujian sudah terlewat",
    };
  }

  let soal = await BankSoalController.findAll({
    where: { id: { [Op.in]: JSON.parse(exam.ujian.soal || "[]") } },
  });
  // Acak urutan soal, kirim TANPA kunci jawaban
  soal = soal
    .sort(() => Math.random() - 0.5)
    .map((item) => ({ id: item.id, soal: item.soal, tipe: item.tipe, point: item.point }));

  if (exam.status === "open") {
    // Batas selesai = min(mulai + durasi, waktu_selesai ujian); remedial tidak dibatasi jendela
    let jamSelesai = calculateWaktuSelesai(exam.ujian.durasi);
    if (!isRemidial) {
      const batas = ujianKeWaktuNyata(exam.ujian.waktu_selesai);
      if (batas < jamSelesai) jamSelesai = batas;
    }
    const detikTersisa = Math.max(Math.floor((jamSelesai - nowNyata) / 1000), 0);

    await NilaiController.update(
      {
        refresh_count: 3,
        status: "progress",
        jam_mulai: nowNyata,
        remidial_count: 0,
        jawaban: JSON.stringify([]),
        waktu_tersisa: Math.ceil(detikTersisa / 60),
        jam_selesai: jamSelesai,
      },
      { where: { id: exam.id, status: "open" } }
    );
    return {
      msg: "Selamat melakukan Ujian",
      waktu_tersisa: detikTersisa,
      refresh_count: 3,
      status_ujian: "progress",
      jawaban: JSON.stringify([]),
      soal: JSON.stringify(soal),
      tipe_ujian: exam.ujian.tipe_ujian,
      mapel: exam.mapel_id,
      id: exam.ujian.id,
    };
  }

  if (exam.status === "progress") {
    const detikTersisa = Math.max(Math.floor((new Date(exam.jam_selesai) - nowNyata) / 1000), 0);
    await NilaiController.update(
      {
        refresh_count: exam.refresh_count - 1,
        waktu_tersisa: Math.ceil(detikTersisa / 60),
      },
      { where: { id: exam.id } }
    );
    return {
      msg: "Selamat melanjutkan Ujian",
      waktu_tersisa: detikTersisa,
      jam_mulai: exam.jam_mulai,
      jam_selesai: exam.jam_selesai,
      refresh_count: exam.refresh_count - 1,
      status_ujian: exam.status,
      jawaban: exam.jawaban,
      soal: JSON.stringify(soal),
      tipe_ujian: exam.ujian.tipe_ujian,
      mapel: exam.mapel_id,
      id: exam.ujian.id,
    };
  }

  return { statusCode: 422, msg: "Ujian ini tidak dapat diambil saat ini" };
});

const submitExam = response.requestResponse(async (req, res) => {
  const id = req.body.id;

  const exam = await NilaiController.findOne({
    where: { id: id, student_id: req.student_id },
    include: [
      {
        model: models.ujian,
        require: true,
        as: "ujian",
        attributes: ["id", "tipe_ujian", "waktu_selesai", "soal"],
      },
    ],
  });

  if (!exam || !exam.ujian) {
    return { statusCode: 422, msg: "Ujian tidak ditemukan" };
  }
  if (exam.status === "finish") {
    return { statusCode: 200, msg: "Ujian telah berakhir" };
  }
  if (exam.status !== "progress") {
    return { statusCode: 422, msg: "Ujian belum dimulai" };
  }

  // Submit setelah waktu habis (+ toleransi) -> pakai jawaban tersimpan terakhir
  const terlambat =
    !!exam.jam_selesai && Date.now() > new Date(exam.jam_selesai).getTime() + GRACE_SUBMIT_MS;
  const sumberJawaban = terlambat ? parseJSON(exam.jawaban, []) : req.body.data;

  const soal = await BankSoalController.findAll({
    attributes: ["id", "tipe", "jawaban", "point"],
    where: { id: { [Op.in]: JSON.parse(exam.ujian.soal || "[]") } },
  });

  const hasil = hitungNilai(soal, sumberJawaban, { pakaiPoinManual: false });
  const riwayat = [...parseJSON(exam.exam, []), hasil.nilai];
  const keterangan = [hasil.keterangan, terlambat ? "Submit terlambat: dinilai dari jawaban tersimpan terakhir" : ""]
    .filter(Boolean)
    .join(". ");

  // Atomik: hanya baris yang masih "progress" yang diubah (cegah submit ganda)
  const [jumlah] = await NilaiController.update(
    {
      jam_submit: new Date(),
      keterangan,
      exam: JSON.stringify(riwayat),
      status: "finish",
      remidial_count: 0,
      jawaban: JSON.stringify(hasil.jawaban),
    },
    { where: { id: exam.id, status: "progress" } }
  );

  if (jumlah === 0) {
    return { statusCode: 200, msg: "Ujian telah berakhir" };
  }

  return {
    msg: terlambat
      ? "Waktu ujian sudah habis. Jawaban tersimpan terakhir yang dinilai."
      : "Jawaban berhasil tersimpan",
    nilai: hasil.nilai,
    keterangan,
    total_point: hasil.total_point,
    point_siswa: hasil.point_siswa,
  };
});

const progressExam = response.requestResponse(async (req, res) => {
  const jawaban = req.body.data;
  const id = req.body.id;

  const exam = await NilaiController.findOne({
    where: { id: id, student_id: req.student_id },
    include: [{ model: models.ujian, as: "ujian", attributes: ["soal"] }],
  });

  if (!exam) {
    return { statusCode: 422, msg: "Ujian tidak ditemukan" };
  }
  if (exam.status === "open") {
    return { statusCode: 422, msg: "Ujian belum dimulai" };
  }
  if (
    exam.status === "finish" ||
    (exam.jam_selesai && Date.now() > new Date(exam.jam_selesai).getTime() + GRACE_SUBMIT_MS)
  ) {
    return {
      msg: "Waktu Ujian telah berakhir, Silahkan submit untuk mengakhiri",
      statusCode: 422,
    };
  }

  // Simpan hanya jawaban untuk soal ujian ini, satu per soal
  const soalIds = parseJSON(exam.ujian?.soal, []);
  const rapi = [...normalisasiJawaban(jawaban, soalIds).values()];

  await NilaiController.update(
    { jam_progress: new Date(), jawaban: JSON.stringify(rapi) },
    { where: { id: exam.id, status: "progress" } }
  );

  return { msg: "Progress Ujian tersimpan" };
});

const notifExam = response.requestResponse(async (req, res) => {
  const exam = await NilaiController.findAndCountAll({
    where: {
      student_id: req.student_id,
      status: "open",
    },
    attributes: {
      exclude: ["jawaban", "urutan"],
    },
    include: [
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
      },
      {
        model: mapelModel,
        as: "mapel",
        attributes: {
          exclude: "mapel_id",
          include: "id",
        },
      },
      {
        model: models.ujian,
        require: true,
        as: "ujian",
        attributes: [
          "id",
          "jenis_ujian",
          "tipe_ujian",
          "waktu_mulai",
          "waktu_selesai",
          "status",
          "durasi",
          "judul_ujian",
          "is_hirarki",
          "urutan",
        ],
        include: [
          {
            model: models.mapel,
            require: true,
            as: "mapel",
            attributes: ["id", "nama_mapel"],
          },
        ],
      },
    ],
  });

  return {
    list: exam,
  };
});

module.exports = { getExam, takeExam, submitExam, progressExam, notifExam };

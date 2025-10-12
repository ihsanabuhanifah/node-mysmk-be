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
          "id",
          "waktu_mulai",
          "waktu_selesai",
          "status",
          "soal",
          "durasi",
        ],
      },
    ],
  });

  if (exam.urutan > 1) {
    const cek = await NilaiController.findOne({
      where: {
        mapel_id: exam.mapel_id,
        kelas_id: exam.kelas_id,
        ta_id: exam.ta_id,
        student_id: req.student_id,
        urutan: {
          [Op.lt]: exam.urutan, // Mencari urutan yang lebih kecil dari exam.urutan
        },
      },

      include: [
        {
          model: models.ujian,
          require: true,
          as: "ujian",
          attributes: ["judul_ujian"],
        },
      ],
      order: [
        ["urutan", "DESC"], // Mengambil urutan terbesar dari yang lebih kecil
      ],
    });

    if (!!cek?.is_lulus === false || !!cek.is_lulus === 0) {
      return {
        statusCode: 422,
        msg: `Anda belum lulus pada exam  ${cek.ujian.judul_ujian} di mata pelajaran ini`,
      };
    }
  }

  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.ujian.soal),
      },
    },
  });

  // Mengacak urutan soal
  soal = soal.sort(() => Math.random() - 0.5);

  if (!exam) {
    return {
      statusCode: 422,
      msg: "Ujian tidak ditemukan",
    };
  }

  if (exam.status === "finish") {
    return {
      statusCode: 422,
      msg: "Ujian telah berakhir",
    };
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

  const now = new Date();
  now.setHours(now.getHours() + 7); // Tambah 7 jam
  const startTime = new Date(exam.ujian.waktu_mulai);
  const endTime = new Date(exam.ujian.waktu_selesai);

  console.log(exam.ujian.tipe_ujian, exam.status, exam.remidial_count);
  if (
    (now >= startTime && now <= endTime) ||
    // exam.status === "open" ||
    exam.status === "progress" ||
    exam.remidial_count === 1
  ) {
    soal = soal.map((item) => {
      return {
        id: item.id,
        soal: item.soal,
        tipe: item.tipe,
        point: item.point,
      };
    });

    if (exam.status === "open") {
      await NilaiController.update(
        {
          refresh_count: 3,
          status: "progress",
          jam_mulai: new Date(),
          remidial_count: 0,
          jawaban: JSON.stringify([]),
          waktu_tersisa: exam.ujian.durasi,
          jam_selesai: calculateWaktuSelesai(exam.ujian.durasi),
        },
        {
          where: {
            id: exam.id,
          },
        }
      );
      return {
        msg: "Selamat melakukan Ujian",
        waktu_tersisa: Number(exam.ujian.durasi) * 60,
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
      await NilaiController.update(
        {
          refresh_count: exam.refresh_count - 1,
          waktu_tersisa:
            calculateMinutesDifference(new Date(), exam.jam_selesai) * 60,
        },
        {
          where: {
            id: exam.id,
          },
        }
      );
      return {
        msg: "Selamat melanjutkan Ujian",
        waktu_tersisa:
          calculateMinutesDifference(new Date(), exam.jam_selesai) * 60,
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
  } else {
    return {
      statusCode: 422,
      msg: "Waktu Ujian belum dimulai",
    };
    // if (now < startTime) {
    //   return {
    //     statusCode: 422,
    //     msg: "Waktu Ujian belum dimulai",
    //   };
    // } else {
    //   return {
    //     statusCode: 422,
    //     msg: "Waktu Ujian sudah terlewat",
    //   };
    // }
  }
});

const submitExam = response.requestResponse(async (req, res) => {
  const jawaban = req.body.data;
  const id = req.body.id;

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
        ],
      },
    ],
  });

  if (!exam) {
    return {
      statusCode: 422,
      msg: "Ujian tidak ditemukan",
    };
  }

  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.ujian.soal),
      },
    },
  });

  if (exam.status === "finish") {
    return {
      statusCode: 200,
      msg: "Ujian telah berakhir",
    };
  }

  if (exam.status === "open") {
    return {
      statusCode: 422,
      msg: "Ujian belum dimulai",
    };
  }

  soal = soal.map((item) => {
    return {
      id: item.id,
      soal: item.soal,
      tipe: item.tipe,
      jawaban: item.jawaban,
      point: item.point,
    };
  });

  let total_point = 0;
  let point_siswa = 0;
  let keterangan = "";
  let nilai = 0;

  // Fungsi untuk membandingkan jawaban MP
  const compareMPAnswers = (jawabanSiswa, kunciJawaban) => {
    // Konversi kunci jawaban dari string "a,b,d" menjadi array ["a", "b", "d"]
    const kunciArray = kunciJawaban.split(',').map(item => item.trim().toLowerCase());
    
    // Pastikan jawaban siswa adalah array dan konversi ke lowercase
    const siswaArray = Array.isArray(jawabanSiswa) 
      ? jawabanSiswa.map(item => item.toLowerCase())
      : [];

    // Urutkan kedua array untuk membandingkan tanpa memperhatikan urutan
    const sortedKunci = [...kunciArray].sort();
    const sortedSiswa = [...siswaArray].sort();

    // Bandingkan apakah kedua array sama persis
    return JSON.stringify(sortedKunci) === JSON.stringify(sortedSiswa);
  };

  // Fungsi untuk membandingkan jawaban MTF (harus sesuai urutan)
  const compareMTFAnswers = (jawabanSiswa, kunciJawaban) => {
    try {
      // Konversi kunci jawaban dari string "true,true,false,false" menjadi array
      const kunciArray = kunciJawaban.split(',').map(item => 
        item.trim().toLowerCase() === "true"
      );
      
      // Konversi jawaban siswa dari string "true,true,false,false" menjadi array boolean
      const siswaArray = typeof jawabanSiswa === 'string' 
        ? jawabanSiswa.split(',').map(item => item.trim().toLowerCase() === "true")
        : Array.isArray(jawabanSiswa)
          ? jawabanSiswa.map(item => item === true || item === "true")
          : [];

      // Pastikan panjang array sama
      if (kunciArray.length !== siswaArray.length) {
        return false;
      }

      // Bandingkan setiap elemen sesuai urutan
      for (let i = 0; i < kunciArray.length; i++) {
        if (kunciArray[i] !== siswaArray[i]) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error comparing MTF answers:', error);
      return false;
    }
  };

  await soal.map((item) => {
    total_point = total_point + item.point;
    
    jawaban?.map((jawab) => {
      if (jawab.id === item.id) {
        if (item.tipe === "MP") {
          // Untuk tipe MP, gunakan fungsi compareMPAnswers
          if (compareMPAnswers(jawab.jawaban, item.jawaban)) {
            point_siswa = point_siswa + item.point;
          }
        } else if (item.tipe === "MTF") {
          // Untuk tipe MTF, gunakan fungsi compareMTFAnswers
          if (compareMTFAnswers(jawab.jawaban, item.jawaban)) {
            point_siswa = point_siswa + item.point;
          }
        } else if (item.tipe !== "ES") {
          // Untuk tipe selain MP, MTF, dan ES
          if (jawab.jawaban === item.jawaban) {
            point_siswa = point_siswa + item.point;
          }
        }

        return {
          ...jawab,
          point: jawab.id === item.id ? item.point : 0,
        };
      }
    });

    // Untuk soal ES
    if (item.tipe === "ES") {
      keterangan = "terdapat essay belum diberikan point";
    }
  });

  nilai = (point_siswa / total_point) * 100;
  nilai = Math.ceil(nilai);

  let exam_result = [];
  if (!!exam.exam === true) {
    exam_result = JSON.parse(exam.exam);
    exam_result = [...exam_result, nilai];
  } else {
    exam_result = [nilai];
  }

  if (!!exam.exam1 === false) {
    await NilaiController.update(
      {
        jam_submit: new Date(),
        keterangan: keterangan,
        exam: JSON.stringify(exam_result),
        status: "finish",
        remidial_count: 0,
        jawaban: JSON.stringify(jawaban),
      },
      {
        where: {
          id: id,
        },
      }
    );

    return {
      msg: "Jawaban berhasil tersimpan",
      nilai: nilai,
      keterangan: keterangan,
      total_point,
      point_siswa,
    };
  }
});

const progressExam = response.requestResponse(async (req, res) => {
  const jawaban = req.body.data;
  const id = req.body.id;

  const exam = await NilaiController.findOne({
    where: {
      id: id,
      student_id: req.student_id,
    },
  });

  if (exam.status === "open") {
    return {
      statusCode: 422,
      msg: "Ujian belum dimulai",
    };
  }

  if (
    calculateMinutesDifference(new Date(), exam.jam_selesai) < -1 ||
    exam.status === "finish"
  ) {
    return {
      msg: "Waktu Ujian telah berakhir, Silahkan submit untuk mengakhiri",
      statusCode: 422,
    };
  }

  await NilaiController.update(
    {
      jam_progress: new Date(),
      jawaban: JSON.stringify(jawaban),
    },
    {
      where: {
        id: id,
      },
    }
  );

  return {
    msg: "Progress Ujian tersimpan",
  };
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

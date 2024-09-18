const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const { checkQuery } = require("../../utils/format");
const { RESPONSE_API } = require("../../utils/response");

const response = new RESPONSE_API();

const submitExamResult = response.requestResponse(async (req, res) => {
  const payload = req.body;

  await Promise.all(
    payload?.map(async (item) => {
      await NilaiController.update({
      
        exam_result: item.exam_result,
        is_lulus : item.is_lulus,
        status : item?.status,
      },{
        where : {
          id : item.id
        }
      });
    })
  );

  return {
    msg : 'Berhasil'
  };
});

const updateLastExam = response.requestResponse(async (req, res) => {
  const { student_id, id, jawaban } = req.body;
  const exam = await NilaiController.findOne({
    where: {
      id: id,
      student_id: student_id,
    },
    include: [
      {
        model: models.ujian,
        require: true,
        as: "ujian",
        attributes: ["status", "soal"],
      },
    ],
  });

  if (exam.status !== "finish") {
    return {
      statusCode: 422,
      msg: "Ujian belum berakhir",
    };
  }

  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.ujian.soal),
      },
    },
  });

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
  let jawaban_siswa;
  await soal.map((item) => {
    total_point = total_point + item.point;
    jawaban_siswa = jawaban?.map((jawab) => {
      if (jawab.id === item.id) {
        if (item.tipe !== "ES") {
          if (jawab.jawaban === item.jawaban) {
            point_siswa = point_siswa + item.point;
          }
        } else {
          if (!!jawab.point === true) {
            point_siswa = point_siswa + (Number(jawab.point) || 0);
          } else {
            keterangan = " Terdapat essay belum diberikan point";
          }
        }
      }
      return jawab;
    });
  });

  nilai = (Number(point_siswa) / Number(total_point)) * 100;

  nilai = Number(nilai.toFixed(2));
  let exam_result = [];
  if (!!exam.exam === true) {
    exam_result = JSON.parse(exam.exam);
    exam_result[exam_result.length - 1] = nilai;
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
        jawaban: JSON.stringify(jawaban_siswa),
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

const getSoal = response.requestResponse(async (req, res) => {
  const exam = await UjianController.findOne({
    attributes: ["soal"],
    where: {
      id: req.params.id,
    },
  });

  let soal = await BankSoalController.findAll({
    where: {
      id: {
        [Op.in]: JSON.parse(exam.soal),
      },
    },
  });
  return {
    status: "Success",
    msg: "Soal ditemukan",
    soal,
  };
});

const remidial = response.requestResponse(async (req, res) => {
  const { payload } = req.body;

  await NilaiController.update(
    { remidial_count: 1, status: "open" },
    {
      where: {
        teacher_id: req.teacher_id,

        id: {
          [Op.in]: payload, // arrayOfIds adalah array yang berisi ID-ID yang ingin di-update
        },
      },
    }
  );

  return {
    status: "Success",
    msg: "Daftar remidial berhasil di perbaharui",
  };
});

const refreshCount = response.requestResponse(async (req, res) => {
  const { payload } = req.body;

  await NilaiController.update(
    { refresh_count: 3 },
    {
      where: {
        teacher_id: req.teacher_id,

        id: {
          [Op.in]: payload, // arrayOfIds adalah array yang berisi ID-ID yang ingin di-update
        },
      },
    }
  );

  return {
    status: "Success",
    msg: "Siswa sudah bisa ujian kembali",
  };
});

const listPenilaianByTeacher = response.requestResponse(async (req, res) => {
  let = { mapel_id, ujian_id, page, pageSize } = req.query;

  const soals = await NilaiController.findAll({
    // attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
    where: {
      // teacher_id: req.teacher_id,
      ujian_id: ujian_id,
      ...(checkQuery(mapel_id) && {
        mapel_id: mapel_id,
      }),
    },
    include: [
      {
        model: models.student,
        require: true,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
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
        ],
      },
    ],
    limit: pageSize,
    offset: page,
  });
  return {
    msg: "Berhasil ditemukan",
    page: req.page,
    pageSize: pageSize,
    data: soals,
  };
});



const listNotificationExam = response.requestResponse(async (req, res) => {
  let = { mapel_id, ujian_id, page, pageSize } = req.query;

  const soals = await NilaiController.findAll({
    // attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
    where: {
      teacher_id: req.teacher_id,
      exam_result : ""
      
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
    limit: pageSize,
    offset: page,
    group: ["teacher_id", "mapel_id", "ta_id", "kelas_id"],
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

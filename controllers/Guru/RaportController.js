const studentModel = require("../../models").student;

const models = require("../../models");
const ReportController = require("../../models").hasil_belajar;
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
function calculateAveragesForAllStudents(data) {
  const results = {};

  // Iterate through the data to group it by student_id, mapel_id, kelas_id, and ta_id
  data.forEach((entry) => {
    const studentId = entry.student_id;
    const mapelId = entry.mapel_id;
    const kelasId = entry.kelas_id;
    const taId = entry.ta_id;
    const examType = entry.jenis_ujian;
    const examResult = parseFloat(entry.exam_result);

    // Initialize the nested structure if it doesn't exist
    if (!results[studentId]) {
      results[studentId] = {};
    }
    if (!results[studentId][mapelId]) {
      results[studentId][mapelId] = {};
    }
    if (!results[studentId][mapelId][kelasId]) {
      results[studentId][mapelId][kelasId] = {};
    }
    if (!results[studentId][mapelId][kelasId][taId]) {
      results[studentId][mapelId][kelasId][taId] = {
        harian: { totalScore: 0, count: 0 },
        tugas: { totalScore: 0, count: 0 },
        projek: { totalScore: 0, count: 0 },
        pts: { totalScore: 0, count: 0 },
        pas: { totalScore: 0, count: 0 },
        us: { totalScore: 0, count: 0 },
      };
    }

    // Add the exam result to the correct place in the nested structure
    const studentData = results[studentId][mapelId][kelasId][taId];
    if (studentData[examType]) {
      studentData[examType].totalScore += examResult;
      studentData[examType].count += 1;
    }
  });

  // Calculate averages for each student and their respective identifiers
  const averagesList = [];
  for (const studentId in results) {
    for (const mapelId in results[studentId]) {
      for (const kelasId in results[studentId][mapelId]) {
        for (const taId in results[studentId][mapelId][kelasId]) {
          const studentData = results[studentId][mapelId][kelasId][taId];
          const averages = {
            student_id: parseInt(studentId),
            mapel_id: parseInt(mapelId),
            kelas_id: parseInt(kelasId),
            ta_id: parseInt(taId),
            rata_nilai_tugas: studentData.tugas.count
              ? (
                  studentData.tugas.totalScore / studentData.tugas.count
                ).toFixed(2)
              : null,
            rata_nilai_harian: studentData.harian.count
              ? (
                  studentData.harian.totalScore / studentData.harian.count
                ).toFixed(2)
              : null,
            rata_nilai_projek: studentData.projek.count
              ? (
                  studentData.projek.totalScore / studentData.projek.count
                ).toFixed(2)
              : null,
            rata_nilai_pts: studentData.pts.count
              ? (studentData.pts.totalScore / studentData.pts.count).toFixed(2)
              : null,
            rata_nilai_pas: studentData.pas.count
              ? (studentData.pas.totalScore / studentData.pas.count).toFixed(2)
              : null,
            rata_nilai_us: studentData.us.count
              ? (studentData.us.totalScore / studentData.us.count).toFixed(2)
              : null,
          };
          averagesList.push(averages);
        }
      }
    }
  }

  return averagesList;
}

const listReport = response.requestResponse(async (req, res) => {
  const { ta_id, mapel_id, kelas_id, student_id } = req.query;
  const report = await ReportController.findAll({
    where: {
      ...(checkQuery(kelas_id) && {
        kelas_id: kelas_id,
      }),

      ...(checkQuery(mapel_id) && {
        mapel_id: mapel_id,
      }),
      ...(checkQuery(ta_id) && {
        ta_id: ta_id,
      }),
      ...(checkQuery(student_id) && {
        student_id: student_id.value,
      }),
    },
    include: [
      {
        model: models.kelas,
        require: true,
        as: "kelas",
        attributes: ["id", "nama_kelas"],
      },
      {
        model: models.student,
        require: true,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
      },
      {
        model: models.teacher,
        require: true,
        as: "teacher",
        attributes: ["id", "nama_guru"],
      },
      {
        model: models.mapel,
        require: true,
        as: "mapel",
        attributes: ["id", "nama_mapel"],
      },
      {
        model: models.ta,
        require: true,
        as: "tahun_ajaran",
        attributes: ["id", "nama_tahun_ajaran"],
      },
    ],
  });

  return {
    msg: "Success",

    data: report,
  };
});

const generateReport = response.requestResponse(async (req, res) => {
  const { ta_id, mapel_id, kelas_id, student_id } = req.body;

  const nilai = await NilaiController.findAll({
    where: {
      ...(checkQuery(kelas_id) && {
        kelas_id: kelas_id,
      }),

      ...(checkQuery(mapel_id) && {
        mapel_id: mapel_id,
      }),
      ...(checkQuery(ta_id) && {
        ta_id: ta_id,
      }),
      ...(checkQuery(student_id) && {
        student_id: student_id.value,
      }),
    },
  });

  if (nilai.length === 0) {
    return {
      statusCode: 422,
      msg: "Tidak ada Ujian ",
    };
  }
  const nilai_rata = await calculateAveragesForAllStudents(nilai);

  await Promise.all(
    nilai_rata?.map(async (item) => {
      console.log("item", item);
      const isExist = await ReportController.findOne({
        where: {
          kelas_id: item.kelas_id,
          mapel_id: item.mapel_id,
          ta_id: item.ta_id,
          student_id: item.student_id,
        },
      });

      console.log("is", isExist);

      if (!isExist) {
        await ReportController.create(item);
      } else {
        await ReportController.update(item, {
          where: {
            kelas_id: item.kelas_id,

            mapel_id: item.mapel_id,
            ta_id: item.ta_id,
            student_id: item.student_id,
          },
        });
      }
    })
  );

  return {
    msg: "Success",
    nilai_rata,
    nilai,
  };
});

module.exports = { listReport, generateReport };

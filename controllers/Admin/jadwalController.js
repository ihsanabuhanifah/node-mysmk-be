const JadwalModel = require("../../models").jadwal;
const KelasModel = require("../../models").kelas_student;
const AbsensiModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const HalaqohModel = require("../../models").halaqoh;
const HalaqohStudentModel = require("../../models").halaqoh_student;
const AbsensiHalaqohModel = require("../../models").absensi_halaqoh;
const models = require("../../models");
const dotenv = require("dotenv");
dotenv.config();
const { formatHari } = require("../../utils/format");

async function schedule(req, res) {
  console.log("jalan");
  try {
    // let hari =   dayjs(timeStamps).format("dddd")

    const date = new Date();
    const hari = await formatHari(date);
    const jadwal = await JadwalModel.findAll({
      where: {
        hari: hari,
        status: 1,
      },
    });

    if (jadwal.length === 0) {
      return res.json({
        msg: "Tidak ada Jadwal",
      });
    }

    await Promise.all(
      jadwal.map(async (data, index) => {
        const siswa = await KelasModel.findAll({
          attributes: ["student_id"],
          where: {
            kelas_id: data.kelas_id,
            status: 1,
          },
        });

        const payload = {
          tanggal: date,
          mapel_id: data.mapel_id,
          kelas_id: data.kelas_id,
          teacher_id: data.teacher_id,
          jam_ke: data.jam_ke,

          semester: data.semester,
          ta_id: data.ta_id,
        };

        await AgendaKelasModel.create(payload);

        data.student = siswa;
      })
    );
    await Promise.all(
      jadwal.map(async (value, index) => {
        await Promise.all(
          value.student.map(async (data) => {
            const payload = {
              tanggal: date,
              hari: value.hari,
              kelas_id: value.kelas_id,
              teacher_id: value.teacher_id,
              mapel_id: value.mapel_id,
              student_id: data.student_id,
              semester: value.semester,
              ta_id: value.ta_id,
              status_absensi: 0,
              status_kehadiran: 6,
            };
            await AbsensiModel.create(payload);
          })
        );
      })
    );
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "fail",
      msg: "Ada Kesalahan",
    });
  }
}

async function scheduleHalaqoh(req, res) {
  try {
    // let hari =   dayjs(timeStamps).format("dddd")

    const date = new Date();
    const hari = await formatHari(date);
    const halaqoh = await HalaqohModel.findAll({
      include: [
        {
          model: models.halaqoh_student,
          require: true,
          as: "halaqoh_student",
          attributes: ["id", "student_id"],
        },
      ],
    });

    await Promise.all(
      halaqoh.map(async (value) => {
        await Promise.all(
          value.halaqoh_student.map(async(data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: date,
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );

    return res.json({
      msg : 'Success',
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "fail",
      msg: "Ada Kesalahan",
    });
  }
}

module.exports = { schedule, scheduleHalaqoh };

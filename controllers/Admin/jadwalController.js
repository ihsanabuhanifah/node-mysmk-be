const JadwalModel = require("../../models").jadwal;
const KelasModel = require("../../models").kelas_student;
const AbsensiModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const HalaqohModel = require("../../models").halaqoh;
const HalaqohStudentModel = require("../../models").halaqoh_student;
const AbsensiHalaqohModel = require("../../models").absensi_halaqoh;
const ScheduleMonitorModel = require("../../models").schedule_monitor;

const models = require("../../models");
const dotenv = require("dotenv");
dotenv.config();
const { formatHari } = require("../../utils/format");
const dayjs = require("dayjs");
const { func } = require("joi");
let moment = require("moment-timezone");
let date = moment().tz("Asia/Jakarta").format("hh:mm:ss");
let hari = formatHari(moment().tz("Asia/Jakarta").format('YYYY-MM-DD'));

async function scheduleKelas(req, res) {
  console.log("jalan");

  try {
    // let hari =   dayjs(timeStamps).format("dddd")

    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: dayjs(date).format("YYYY-MM-DD"),
        kegiatan: "KBM",
      },
    });

    if (cek) {
      return res.json({
        msg: "Absensi hari ini sudah dbuat",
      });
    }
    

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
          tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
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
              tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
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

    let laporan = {
      tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
      keterangan: `Absensi kelas tanggal ${dayjs(date).format(
        "DD-MM-YY"
      )} berhasil dibuat`,
      kegiatan: "KBM",
    };
    await ScheduleMonitorModel.create(laporan);
    return res.json({
      msg: "Success",
    });
  } catch (err) {
    console.log(err);
    // return res.status(403).json({
    //   status: "fail",
    //   msg: "Ada Kesalahan",
    // });
  }
}

async function scheduleHalaqoh(req, res) {
  try {
    

    if (hari === "sabtu")
      return res.json({
        msg: "hari ini libur",
      });

    if (hari === "minggu")
      return res.json({
        msg: "hari ini libur",
      });

    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: dayjs(date).format("YYYY-MM-DD"),
        kegiatan: "Halaqoh",
      },
    });

    if (cek) {
      return res.json({
        msg: "Absensi hari ini sudah dbuat",
      });
    }
    const halaqoh = await HalaqohModel.findAll({
      attributes: ["id"],
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
          value.halaqoh_student.map(async (data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
              status_kehadiran: 6,
              status_absensi: 0,
              waktu: "pagi",
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );

    let laporan = {
      tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
      keterangan: `Absensi Halaqoh tanggal ${dayjs(date).format(
        "DD-MM-YY"
      )} berhasil dibuat`,
      kegiatan: "Halaqoh",
    };
    await ScheduleMonitorModel.create(laporan);

    return res.json({
      msg: "Success",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "fail",
      msg: "Ada Kesalahan",
      data: err,
    });
  }
}

//manual

async function scheduleKelasManual(req, res) {
  
  try {
    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
        kegiatan: "KBM",
      },
    });

    if (cek) {
      return res.json({
        msg: "Absensi hari ini sudah dbuat",
      });
    }
    

   

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
        for (let i = 0; i < data?.jumlah_jam; i++) {
          const payload = {
            tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
            mapel_id: data.mapel_id,
            kelas_id: data.kelas_id,
            teacher_id: data.teacher_id,
            jam_ke: data.jam_ke,

            semester: data.semester,
            ta_id: data.ta_id,
          };

          await AgendaKelasModel.create(payload);
        }

        data.student = siswa;
      })
    );

    await Promise.all(
      jadwal.map(async (value, index) => {
        await Promise.all(
          value.student.map(async (data) => {
            const payload = {
              tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
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

    let laporan = {
      tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
      keterangan: `Absensi kelas tanggal ${moment()
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD")} berhasil dibuat`,
      kegiatan: "KBM",
    };
    await ScheduleMonitorModel.create(laporan);
    return res.json({
      msg: "Success",
    });
  } catch (err) {
    console.log(err);
    return res.status(422).json({
      status: "fail",
      msg: "Ada Kesalahan",
      err,
    });
  }
}

async function scheduleHalaqohManual(req, res) {
  try {
    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
        kegiatan: "Halaqoh",
      },
    });

    if (cek) {
      return res.json({
        msg: "Absensi Halaqoh hari ini sudah dbuat",
      });
    }
    

    if (hari === "sabtu")
      return res.json({
        msg: "hari ini libur",
      });

    if (hari === "minggu")
      return res.json({
        msg: "hari ini libur",
      });

    const halaqoh = await HalaqohModel.findAll({
      attributes: ["id"],
      include: [
        {
          model: models.halaqoh_student,
          require: true,
          as: "halaqoh_student",
          attributes: ["id", "student_id"],
        },
      ],
    });
    // return res.json({
    //   halaqoh
    // })
    await Promise.all(
      halaqoh.map(async (value) => {
        await Promise.all(
          value.halaqoh_student.map(async (data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
              status_kehadiran: 6,
              status_absensi: 0,
              waktu: "pagi",
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );

    let laporan = {
      tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
      keterangan: `Absensi Halaqoh tanggal ${moment()
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD")} berhasil dibuat`,
      kegiatan: "Halaqoh",
    };
    await ScheduleMonitorModel.create(laporan);

    return res.json({
      msg: "Success",
    });
  } catch (err) {
    console.log(err);
    return res.status(422).json({
      status: "fail",
      msg: "Ada Kesalahan",
      data: err,
    });
  }
}

async function scheduleCek(req, res) {
  try {
    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: moment().tz("Asia/Jakarta").format("YYYY-MM-DD"),
      },
    });

    if (cek) {
      return res.json({
        result: true,
      });
    }
    return res.json({
      result: false,
      date: dayjs(date).format("YYYY-MM-DD"),
      cek,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Ada Kesalahan",
      data: err,
    });
  }
}

module.exports = {
  scheduleKelas,
  scheduleHalaqoh,
  scheduleKelasManual,
  scheduleHalaqohManual,
  scheduleCek,
};

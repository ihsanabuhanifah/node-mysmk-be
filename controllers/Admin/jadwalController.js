const JadwalModel = require("../../models").jadwal;
const KelasModel = require("../../models").kelas_student;
const AbsensiModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const HalaqohModel = require("../../models").halaqoh;
const HalaqohStudentModel = require("../../models").halaqoh_student;
const AbsensiHalaqohModel = require("../../models").absensi_halaqoh;
const ScheduleMonitorModel = require("../../models").schedule_monitor;
const LaporanGuruPiketModel = require("../../models").laporan_guru_piket;
const GuruPiketModel = require("../../models").guru_piket;
const PengampuModel = require("../../models").pengampu_halaqoh;
const { sendNotificationToClient } = require("../../firebase/notify");
const {fcm} = require('../../firebase/firebaseInit');

const models = require("../../models");
const dotenv = require("dotenv");
dotenv.config();

const { hari, tanggal } = require("../../utils/tanggal");

async function scheduleKelas(req, res) {
  try {
    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: tanggal,
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

    const jadwalGuruPiket = await GuruPiketModel.findAll({
      where: {
        hari: hari,
        status: 1,
      },
    });

    let laporan = {
      tanggal: tanggal,
      keterangan: `Absensi kelas tanggal ${tanggal} berhasil dibuat`,
      kegiatan: "KBM",
    };
    await ScheduleMonitorModel.create(laporan);
    let laporanGuruPiket = {
      tanggal: tanggal,
      keterangan: `Absensi Guru Piket tanggal ${tanggal} berhasil dibuat`,
      kegiatan: "Guru",
    };
    await ScheduleMonitorModel.create(laporanGuruPiket);

    if (jadwalGuruPiket.length !== 0) {
      await Promise.all(
        jadwalGuruPiket.map(async (data) => {
          const payload = {
            teacher_id: data?.teacher_id,
            tanggal: tanggal,
            laporan: null,
            diperiksa_oleh: null,
            status: 0,
            ta_id: data?.ta_id,
          };

          await LaporanGuruPiketModel.create(payload);
        })
      );
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
            tanggal: tanggal,
            mapel_id: data.mapel_id,
            kelas_id: data.kelas_id,
            teacher_id: data.teacher_id,
            jam_ke: data.jam_ke + i,

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
              tanggal: tanggal,
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
  }
}

//manual

async function scheduleKelasManual(req, res) {
  try {
    // const notificationData = {
    //   title: "New message",
    //   body: "ihsan",
    // };

    

    // const tokens = [
    //   "fKpWn59kC-q8oVVxdR6u8w:APA91bEI4Brt0-akWKwiHJD06sUQv508ga_-AJneaTxjq0lCOSFqVNoIaT6IBwdiWd1rpaM07RD83mE6B1vLDJNWJjmZRPzCDGLgZdppco8W14hAp6yE4X2h0M8oA1qbkLcPb4XhTSpi", "fQ2drkZlkyQxncsUOA0T48:APA91bG5xFanU_uVarDO_jt7QrKT9uQDVHwWp3EMt71MwCDJUSoQVLC-SjiXsZPbJGZu6XLkJne5MU9n5ZyDLS0Tqw_DI3gCkUD1b9dFiRGMCAhkQxeDYmhX0dyFbRsxmFQTYsrO2fh7"
    // ];
    try {
      const success = await sendNotificationToClient(tokens, notificationData);
      console.log('berhasil')
      return res.json({
        msg: "Absensi hari ini sudah dbuat",
        success
      });
    } catch (errs) {
      console.log('err')
      console.log(errs);
    }
    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: tanggal,
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
    const jadwalGuruPiket = await GuruPiketModel.findAll({
      where: {
        hari: hari,
        status: 1,
      },
    });

    let laporan = {
      tanggal: tanggal,
      keterangan: `Absensi kelas tanggal ${tanggal} berhasil dibuat`,
      kegiatan: "KBM",
    };
    await ScheduleMonitorModel.create(laporan);
    let laporanGuruPiket = {
      tanggal: tanggal,
      keterangan: `Absensi Guru Piket tanggal ${tanggal} berhasil dibuat`,
      kegiatan: "Guru",
    };
    await ScheduleMonitorModel.create(laporanGuruPiket);

    if (jadwalGuruPiket.length !== 0) {
      await Promise.all(
        jadwalGuruPiket.map(async (data) => {
          const payload = {
            teacher_id: data?.teacher_id,
            tanggal: tanggal,
            laporan: null,
            diperiksa_oleh: null,
            status: 0,
            ta_id: data?.ta_id,
          };

          await LaporanGuruPiketModel.create(payload);
        })
      );
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
            tanggal: tanggal,
            mapel_id: data.mapel_id,
            kelas_id: data.kelas_id,
            teacher_id: data.teacher_id,
            jam_ke: data.jam_ke + i,

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
              tanggal: tanggal,
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
        tanggal: tanggal,
        kegiatan: "Halaqoh",
      },
    });

    if (cek) {
      return res.json({
        msg: "Absensi Halaqoh hari ini sudah dbuat",
      });
    }

    // if (hari === "sabtu")
    //   return res.json({
    //     msg: "hari ini libur",
    //   });

    // if (hari === "minggu")
    //   return res.json({
    //     msg: "hari ini libur",
    //   });

    const halaqoh = await HalaqohModel.findAll({
      attributes: ["id"],
      include: [
        {
          model: models.halaqoh_student,
          require: true,
          as: "halaqoh_student",
          attributes: ["id", "student_id"],
          where: {
            status: 1,
          },
        },
      ],
    });

    const pengampu = await HalaqohModel.findAll({
      where: {
        status: 1,
      },
    });

    if (halaqoh.length === 0) {
      return res.json({
        msg: "Kelompok Halaqoh belum dibuat",
      });
    }
    let laporan = {
      tanggal: tanggal,
      keterangan: `Absensi Halaqoh tanggal ${tanggal} berhasil dibuat`,
      kegiatan: "Halaqoh",
    };
    await ScheduleMonitorModel.create(laporan);
    await Promise.all(
      pengampu.map(async (value) => {
        const paylaod = {
          halaqoh_id: value?.id,
          teacher_id: value?.teacher_id,
          status_kehadiran: 6,
          status: 0,
          tanggal: tanggal,
          ta_id: value?.ta_id,
          waktu: "pagi",
        };

        await PengampuModel.create(paylaod);
      })
    );
    await Promise.all(
      pengampu.map(async (value) => {
        const paylaod = {
          halaqoh_id: value?.id,
          teacher_id: value?.teacher_id,
          status_kehadiran: 6,
          status: 0,
          tanggal: tanggal,
          ta_id: value?.ta_id,
          waktu: "malam",
        };

        await PengampuModel.create(paylaod);
      })
    );
    await Promise.all(
      halaqoh.map(async (value) => {
        await Promise.all(
          value.halaqoh_student.map(async (data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: tanggal,
              status_kehadiran: 6,
              status_absensi: 0,
              waktu: "pagi",
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );
    await Promise.all(
      halaqoh.map(async (value) => {
        await Promise.all(
          value.halaqoh_student.map(async (data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: tanggal,
              status_kehadiran: 6,
              status_absensi: 0,
              waktu: "malam",
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );

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
        tanggal: tanggal,
      },
    });

    if (cek) {
      return res.json({
        result: true,
      });
    }
    return res.json({
      result: false,
      date: tanggal,
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

async function scheduleHalaqoh(req, res) {
  try {
    const cek = await ScheduleMonitorModel.findOne({
      where: {
        tanggal: tanggal,
        kegiatan: "Halaqoh",
      },
    });

    if (cek) {
      return res.json({
        msg: "Absensi Halaqoh hari ini sudah dbuat",
      });
    }

    // if (hari === "sabtu")
    //   return res.json({
    //     msg: "hari ini libur",
    //   });

    // if (hari === "minggu")
    //   return res.json({
    //     msg: "hari ini libur",
    //   });

    const halaqoh = await HalaqohModel.findAll({
      attributes: ["id"],
      include: [
        {
          model: models.halaqoh_student,
          require: true,
          as: "halaqoh_student",
          attributes: ["id", "student_id"],
          where: {
            status: 1,
          },
        },
      ],
    });

    const pengampu = await HalaqohModel.findAll({
      where: {
        status: 1,
      },
    });

    if (halaqoh.length === 0) {
      return res.json({
        msg: "Kelompok Halaqoh belum dibuat",
      });
    }
    let laporan = {
      tanggal: tanggal,
      keterangan: `Absensi Halaqoh tanggal ${tanggal} berhasil dibuat`,
      kegiatan: "Halaqoh",
    };
    await ScheduleMonitorModel.create(laporan);
    await Promise.all(
      pengampu.map(async (value) => {
        const paylaod = {
          halaqoh_id: value?.id,
          teacher_id: value?.teacher_id,
          status_kehadiran: 6,
          status: 0,
          tanggal: tanggal,
          ta_id: value?.ta_id,
          waktu: "pagi",
        };

        await PengampuModel.create(paylaod);
      })
    );
    await Promise.all(
      pengampu.map(async (value) => {
        const paylaod = {
          halaqoh_id: value?.id,
          teacher_id: value?.teacher_id,
          status_kehadiran: 6,
          status: 0,
          tanggal: tanggal,
          ta_id: value?.ta_id,
          waktu: "malam",
        };

        await PengampuModel.create(paylaod);
      })
    );
    await Promise.all(
      halaqoh.map(async (value) => {
        await Promise.all(
          value.halaqoh_student.map(async (data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: tanggal,
              status_kehadiran: 6,
              status_absensi: 0,
              waktu: "pagi",
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );
    await Promise.all(
      halaqoh.map(async (value) => {
        await Promise.all(
          value.halaqoh_student.map(async (data) => {
            const payload = {
              student_id: data.student_id,
              halaqoh_id: value.id,
              tanggal: tanggal,
              status_kehadiran: 6,
              status_absensi: 0,
              waktu: "malam",
            };

            await AbsensiHalaqohModel.create(payload);
          })
        );
      })
    );

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
        tanggal: tanggal,
      },
    });

    if (cek) {
      return res.json({
        result: true,
      });
    }
    return res.json({
      result: false,
      date: tanggal,
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

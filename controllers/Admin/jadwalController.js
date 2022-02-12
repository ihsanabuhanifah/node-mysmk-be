const JadwalModel = require("../../models").jadwal;
const KelasModel = require("../../models").kelas_student;
const AbsensiModel = require("../../models").absensi_kelas;
const AgendaKelasModel = require("../../models").agenda_kelas;
const dotenv = require("dotenv");
dotenv.config();
const { formatHari } = require("../../utils/format");

async function schedule(req, res) {
    console.log('jalan')
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
           jam_ke : data.jam_ke,
           
          
            semester: data.semester,
            ta_id: data.ta_id,
           
          };

        await AgendaKelasModel.create(payload)

        console.log("sebelum perualgnan", index);

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
              status_absensi : 0
            };
            await AbsensiModel.create(payload);
          })
        );
      })
    );

    console.log("ini return");
    return res.json({
      jadwal: "ok",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: "fail",
      msg: "Ada Kesalahan",
    });
  }
}

module.exports = { schedule };

const HalaqohModel = require("../../models").absensi_halaqoh;

const models = require("../../models");
const { Op } = require("sequelize");

async function listHalaqoh(req, res) {
  let {
    kelas_id,
    student_id,
    mapel_id,
    tahun_ajaran,
    status_kehadiran,
    semester,
    dariTanggal,
    sampaiTanggal,
    page,
    pageSize,
  } = req.query;
  try {
    const agenda = await AgendaKelasModel.findAll({
      // attributes: ["id","jam_ke" , "materi" , 'tanggal' , 'semester' , 'ta_id'],
      where: {
        ...(semester !== undefined && { semester: semester }),
        ...(dariTanggal !== undefined && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },
    });
    const absensi = await AbsensiKelasModel.findAll({
      attributes: ["id", "semester", "tanggal", "keterangan"],
      where: {
        ...(semester !== undefined && { semester: semester }),
        ...(dariTanggal !== undefined && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },
      order: [["tanggal", "desc"]],
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: kelas_id !== undefined ? { id: kelas_id } : {},
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: student_id !== undefined ? { id: student_id } : {},
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
          where: mapel_id !== undefined ? { id: mapel_id } : {},
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
          where:
            tahun_ajaran !== undefined
              ? { nama_tahun_ajaran: tahun_ajaran }
              : {},
        },
        {
          model: models.status_kehadiran,
          require: true,
          as: "kehadiran",
          attributes: ["id", "nama_status_kehadiran"],
          where:
            status_kehadiran !== undefined
              ? { nama_status_kehadiran: status_kehadiran }
              : {},
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Absensi ditemukan",
      absensi,
      agenda,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function updateHalaqoh(req, res) {
  try {
    let { tanggal, halaqoh_id, waktu, absensi_kehadiran } = req.body;

    await Promise.all(
      absensi_kehadiran.map(async (data) => {
        let payload = {
          student_id: data.student_id,
          halaqoh_id: halaqoh_id,
          tanggal: tanggal,
          dari_surat: data.dari_surat,
          sampai_surat: data.sampai_surat,
          dari_ayat: data.dari_ayat,
          sampai_ayat: data.sampai_ayat,
          total_halaman: data.total_halaman,
          juz_ke: data.juz_ke,
          ketuntasan_juz: data.ketuntasan_juz,
          status_kehadiran: data.status_kehadiran,
          keterangan: data.keterangan,
          kegiatan: data.kegiatan,
          waktu: data.waktu,
        };
        await HalaqohModel.update(payload, {
          where: {
            id: data.id,
          },
        });
      })
    );

    return res.status(200).json({
      status: "Success",
      msg: "Absensi Halaqoh Berhasil di Simpan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
module.exports = { listHalaqoh, updateHalaqoh };

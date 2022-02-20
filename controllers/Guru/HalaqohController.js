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
    const halaqoh = await HalaqohModel.findAndCountAll({
      attributes: [
        "id",
        "tanggal",
       
        "dari_ayat",
      
        "sampai_ayat",
        "total_halaman",
        "juz_ke",
        "ketuntasan_juz",
        "status_kehadiran",
        "keterangan",
        "status_absensi",
        "waktu",
      ],
      where: {
        ...(semester !== undefined && { semester: semester }),
        ...(dariTanggal !== undefined && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
      },

      include: [

        {
          model: models.halaqoh,
          require: true,
          as: "halaqoh",
          attributes: ["id", "nama_kelompok", "semester"],
          where: {
            teacher_id: req.teacher_id,
          },
          include: [
            {
              model: models.ta,
              require: true,
              as: "tahun_ajaran",
              attributes: ["id", "nama_tahun_ajaran"],
            },
          ],
          // where: kelas_id !== undefined ? { id: kelas_id } : {},
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: student_id !== undefined ? { id: student_id } : {},
        },
        {
          model: models.alquran,
          require: true,
          as: "surat_awal",
          attributes: ["id", "nama_surat"],
          
        },
        {
          model: models.alquran,
          require: true,
          as: "surat_akhir",
          attributes: ["id", "nama_surat"],
          
        },
      ],

      order: [["tanggal", "desc"]],
      limit: pageSize,
      offset: page,
    });

    return res.json({
      status: "Success",
      msg: "Absensi ditemukan",
      halaqoh,
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

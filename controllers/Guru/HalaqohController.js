const HalaqohModel = require("../../models").absensi_halaqoh;
const PengampuModel = require("../../models").pengampu_halaqoh;
const { checkQuery } = require("../../utils/format");
const models = require("../../models");
const { Op } = require("sequelize");

async function belumAbsensitHalaqoh(req, res) {
  let {
   
    page,
    waktu,
    pageSize,
  } = req.query;
  try {
    const halaqoh = await HalaqohModel.findAll({
      attributes: ["id", "tanggal", "waktu"],
      where: {
        status_absensi: 0,
      },

      include: [
        {
          model: models.halaqoh,
          require: true,
          as: "halaqoh",
          attributes: ["id", "nama_kelompok", "semester"],

          include: [
            {
              model: models.ta,
              require: true,
              as: "tahun_ajaran",
              attributes: ["id", "nama_tahun_ajaran"],
            },
            {
              model: models.teacher,
              require: true,
              as: "teacher",
              attributes: ["id", "nama_guru"],
            },
          ],
          // where: kelas_id !== undefined ? { id: kelas_id } : {},
        },
      ],

      order: [["tanggal", "desc"]],
      group: ["waktu", "tanggal", "halaqoh_id"],

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
    waktu,
    pageSize,
  } = req.query;
  try {
    const halaqoh = await HalaqohModel.findAndCountAll({
      attributes: [
        "id",
        "tanggal",
        "dari_surat",

        "dari_ayat",
        "sampai_surat",
        "sampai_ayat",
        "total_halaman",
        "juz_ke",
        "ketuntasan_juz",
        "status_kehadiran",
        "keterangan",
        "status_absensi",
        "waktu",
        "tipe",
      ],
      where: {
        ...(checkQuery(semester) && {
          semester: semester,
        }),
        ...(checkQuery(dariTanggal) && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
        ...(checkQuery(waktu) && {
          waktu: waktu,
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
          model: models.status_kehadiran,
          require: true,
          as: "kehadiran",
          attributes: ["id", "nama_status_kehadiran"],
          where:
            status_kehadiran !== undefined
              ? { nama_status_kehadiran: status_kehadiran }
              : {},
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: student_id !== undefined ? { id: student_id } : {},
        },
        // {
        //   model: models.alquran,
        //   require: true,
        //   as: "surat_awal",
        //   attributes: ["id", "nama_surat"],
        // },
        // {
        //   model: models.alquran,
        //   require: true,
        //   as: "surat_akhir",
        //   attributes: ["id", "nama_surat"],
        // },
      ],

      order: [
        ["tanggal", "desc"],
        [{ model: models.student, as: "siswa" }, "nama_siswa", "asc"],
      ],

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
          tipe: data.tipe,
          status_absensi: 1,
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

const notifikasiHalaqoh = async (req, res) => {
  try {
    const notifikasi = await HalaqohModel.findAll({
      attributes: ["id", "tanggal", "waktu"],
      where: {
        status_absensi: 0,
      },
      include: [
        {
          model: models.halaqoh,
          require: true,
          as: "halaqoh",
          attributes: ["id", "nama_kelompok", "semester", "teacher_id"],
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
      ],
      order: [["tanggal", "desc"]],
      group: ["waktu", "tanggal"],
    });

    return res.json({
      status: "Success",
      msg: "notifikasi absensi",
      data: notifikasi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

async function updatePengampuHalaqoh(req, res) {
  let payload = req.body;

  console.log(payload);
  try {
    await Promise.all(
      payload.map(async (data) => {
        let values = {
          status_kehadiran: data?.status_kehadiran,
          absen_by: req.teacher_id,
          status: 1,
          keterangan: data?.keterangan,
        };
        await PengampuModel.update(values, {
          where: {
            id: data.id,
          },
        });

        if (data?.status_kehadiran !== 1) {
          let payload = {
            status_absensi: 1,
            status_kehadiran: 8,
          };
          await HalaqohModel.update(payload, {
            where: {
              halaqoh_id: data.halaqoh_id,
              tanggal: data.tanggal,
            },
          });
        }
      })
    );

    return res.json({
      status: "Success",
      msg: "Absensi Berhasil",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function listPengampuHalaqoh(req, res) {
  try {
    let {
      status_kehadiran,
      nama_guru,
      tahun_ajaran,
      dariTanggal,
      sampaiTanggal,
      page,
      pageSize,
      waktu,
    } = req.query;

    const pengampu = await PengampuModel.findAndCountAll({
      where: {
        ...(checkQuery(dariTanggal) && {
          tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
        }),
        ...(checkQuery(waktu) && {
          waktu: waktu,
        }),
      },
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
          where: {
            ...(checkQuery(nama_guru) && {
              nama_guru: {
                [Op.substring]: nama_guru,
              },
            }),
          },
        },
        {
          model: models.status_kehadiran,
          require: true,
          as: "kehadiran",
          attributes: ["id", "nama_status_kehadiran"],
          where: {
            ...(checkQuery(status_kehadiran) && {
              id: {
                [Op.substring]: status_kehadiran,
              },
            }),
          },
        },
        {
          model: models.teacher,
          require: true,
          as: "diabsen",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
          where: {
            ...(checkQuery(tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring]: tahun_ajaran,
              },
            }),
          },
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Jadwal ditemukan",
      data: pengampu,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
module.exports = {
  listHalaqoh,
  updateHalaqoh,
  notifikasiHalaqoh,
  listPengampuHalaqoh,
  updatePengampuHalaqoh,
  belumAbsensitHalaqoh
};

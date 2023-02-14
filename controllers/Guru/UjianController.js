const UjianController = require("../../models").ujian;
const { Op } = require("sequelize");

const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").student;
const models = require("../../models");
const { checkQuery } = require("../../utils/format");
const createUjian = async (req, res) => {
  try {
    const {
      jenis_ujian,
      mapel_id,
      kelas_id,
      teacher_id,
      soal,
      waktu_mulai,
      waktu_selesai,
      status,
      student_access,
    } = req.body;
    await UjianController.create({
      jenis_ujian,
      mapel_id,
      kelas_id,
      teacher_id,
      soal: JSON.stringify(soal),
      waktu_mulai,
      waktu_selesai,
      status,
      student_access: JSON.stringify(student_access),
    });
    // await Promise.all(
    //   payload?.map(async (item) => {
    //     try {
    //       await BankSoalController.create(item);
    //       success = success + 1;
    //     } catch {
    //       gagal = gagal + 1;
    //     }
    //   })
    // );
    return res.status(201).json({
      status: "Success",
      msg: "Berhasil membuat soal ujian",
      // msg: `Berhasil upload ${success} soal dari ${total} soal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const listUjian = async (req, res) => {
  let = { mapel_id, is_all, jenis_ujian, page, pageSize } = req.query;

  try {
    const soals = await UjianController.findAndCountAll({
      // attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
      where: {
        ...(checkQuery(mapel_id) && {
          mapel_id: mapel_id,
        }),

        ...(parseInt(is_all) === 1 && {
          teacher_id: req.teacher_id,
        }),
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      limit: pageSize,
      offset: page,
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: soals,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const detailUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const ujian = await UjianController.findOne({
      where: {
        id: id,
      },
    });

    const soalUjian = JSON.parse(ujian.soal);
    const siswaAccess = JSON.parse(ujian.student_access);
    const soal = await BankSoalController.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      where: {
        id: {
          [Op.in]: soalUjian,
        },
      },
    });
    const siswa = await StudentModel.findAll({
      attributes: ["id", "nama_siswa"],
      where: {
        id: {
          [Op.in]: siswaAccess,
        },
      },
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      student_access: siswa,
      soal_ujian: soal,
      detail_ujian: ujian,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const updateUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      jenis_ujian,
      mapel_id,
      teacher_id,
      soal,
      waktu_mulai,
      waktu_selesai,
      status,
      student_access,
      kelas_id,
    } = req.body;

    const ujian = await UjianController.findOne({
      where: {
        id: id,
      },
    });

    if (ujian === null) {
      return res.status(403).json({
        status: "Fail",
        msg: "ujian tidak Ditemukan",
      });
    }
    if (ujian.teacher_id !== req.teacher_id) {
      return res.status(422).json({
        status: "Fail",
        msg: "Ujian ini milik guru lain",
      });
    }

    await UjianController.update(
      {
        jenis_ujian,
        mapel_id,
        kelas_id,
        teacher_id,
        soal: JSON.stringify(soal),
        waktu_mulai,
        waktu_selesai,
        status,
        student_access: JSON.stringify(student_access),
      },
      {
        where: {
          id,
        },
      }
    );
    return res.json({
      status: "Success",
      msg: "Update Success",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const deleteUjian = async (req, res) => {
  try {
    const { id } = req.params;

    const ujian = await UjianController.findOne({
      where: {
        id: id,
      },
    });

    if (ujian === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "Ujian Tidak Ditemukan",
      });
    }
    if (ujian.teacher_id !== req.teacher_id) {
      return res.status(422).json({
        status: "Fail",
        msg: "Soal ini milik guru lain",
      });
    }
    await UjianController.destroy({
      where : {
        id : ujian.id
      }
    })

    return res.status(200).json({
      status: "Success",
      msg: `Delete Success`,
     
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

module.exports = {
  createUjian,
  listUjian,
  detailUjian,
  updateUjian,
  deleteUjian,
};

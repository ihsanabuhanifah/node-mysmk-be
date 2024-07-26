const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const { checkQuery } = require("../../utils/format");

const createPenilaian = async (req, res) => {
  try {
    const payload = req.body;

    await UjianController.update(
      {
        status: "open",
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );

    const student = await StudentModel.findAll({
      where: {
        kelas_id: req.body.kelas_id,
      },
    });

    await Promise.all(
      student.map(async (data) => {
        await NilaiController.create({
          ujian_id: req.body.id,
          teacher_id: req.teacher_id,
          student_id: data.student_id,
          waktu_tersisa: 90,
        });
      })
    );

    console.log("pay", student);

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil membuat Penilaian Ujian",

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

const createUjian = async (req, res) => {
  try {
    const payload = req.body.payload[0];

    await UjianController.create({
      ...payload,
      status: "draft",
      soal: JSON.stringify(payload.soal),
      student_access: JSON.stringify(payload.student_access),
      teacher_id: req.teacher_id,
    });

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

const listPenilaianByTeacher = async (req, res) => {
  let = { mapel_id, ujian_id, page, pageSize } = req.query;

  try {
    const soals = await NilaiController.findAll({
      // attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
      where: {
        teacher_id: req.teacher_id,
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
            
          ],
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

    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",

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

    const payload = req.body.payload[0];
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

    console.log("pua", payload);

    await UjianController.update(
      {
        ...payload,

        soal: JSON.stringify(payload.soal),
        student_access: JSON.stringify(payload.student_access),
        teacher_id: req.teacher_id,
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
      where: {
        id: ujian.id,
      },
    });

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

  detailUjian,
  updateUjian,
  deleteUjian,
  createPenilaian,
  listPenilaianByTeacher,
};

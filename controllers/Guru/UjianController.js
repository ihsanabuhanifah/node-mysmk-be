const UjianController = require("../../models").ujian;
const { Op, where } = require("sequelize");
const NilaiController = require("../../models").nilai;
const BankSoalController = require("../../models").bank_soal;
const StudentModel = require("../../models").kelas_student;
const models = require("../../models");
const {
  checkQuery,
  calculateMinutesDifference,
} = require("../../utils/format");

const createPenilaian = async (req, res) => {
  try {
   

    const student = await StudentModel.findAll({
      where: {
        kelas_id: req.body.kelas_id,
      },
    });

    if(student.length === 0){
      return res.status(422).json({
        status: "Success",
        msg: "Kelas ini tidak memili siswa",
  
        // msg: `Berhasil upload ${success} soal dari ${total} soal`,
      });
    }
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
   

    await Promise.all(
      student.map(async (data) => {
        await NilaiController.create({
          ujian_id: req.body.id,
          mapel_id: req.body.mapel_id,
          kelas_id: req.body.kelas_id,
          jenis_ujian : req.body.jenis_ujian,
          exam_result: 0,
          teacher_id: req.teacher_id,
          student_id: data.student_id,
          waktu_tersisa: req.body.durasi,
          ta_id : req.body.ta_id,

          status: "open",
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

    let soal = await BankSoalController.findAll({
      where: {
        id: {
          [Op.in]: JSON.parse(ujian.soal),
        },
      },
    });

    ujian.soal = JSON.stringify(soal);

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
      return res.status(422).json({
        status: "Fail",
        msg: "ujian tidak Ditemukan",
      });
    }

    if (ujian.status === "open") {
      return res.status(422).json({
        status: "Fail",
        msg: "ujian sudah dimulai, tidak bisa memperbaharui",
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
  listUjian,
  detailUjian,
  updateUjian,
  deleteUjian,
  createPenilaian,
};

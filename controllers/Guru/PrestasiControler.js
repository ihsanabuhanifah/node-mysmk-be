const PrestasiModel = require("../../models").prestasi;
const StudentModel = require("../../models").student;
const TeacherModel = require("../../models").teacher;
const TaModel = require("../../models").ta;
const models = require("../../models");
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");

const listPrestasi = async (req, res) => {
  let { nama_siswa, pelapor, penindak, page, pageSize } = req.query;
  try {
    const pelanggaran = await PrestasiModel.findAndCountAll({
      //   attributes: ["id", "tanggal", "status", "tindakan", "semester"],
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      include: [
        {
          model: StudentModel,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
          },
        },
        {
          model: TeacherModel,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },

        {
          model: TaModel,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      order: [["id", "desc"]],
    });
    return res.json({
      status: "Success",
      page: req.page,
      pageSize: pageSize,
      data: pelanggaran,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const detailPrestasi = async (req, res) => {
  return res.send("ok");
};

const deletePrestasi = async (req, res) => {
  return res.send("delete");
};

const createPrestasi = async (req, res) => {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          const create = await PrestasiModel.create({
            tanggal: data.tanggal,
            teacher_id: data.teacher_id,
            prestasi: data.prestasi,
            kategori: data.kategori,
            student_id: data.student_id,
            semester: data.semester,
            ta_id: data?.ta_id,
          });
          if (create) {
            berhasil = berhasil + 1;
          } else {
            gagal = gagal + 1;
          }
        } catch {
          gagal = gagal + 1;
        }
      })
    );

    return res.json({
      status: "Success",
      berhasil,
      gagal,
      msg: `${berhasil} data ditambahkan dan ${gagal} gagal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const updatePrestasi = async (req, res) => {
  try {
    const { payload } = req.body;

    const data = await PrestasiModel.findOne({
      where: {
        id: payload.id,
        teacher_id: req.teacher_id,
      },
    });

    if (!data) {
      return res.status(422).json({
        status: "Fail",
        msg: "Anda tidak meiliki Akses untuk merubah data ini",
      });
    }
    await PrestasiModel.update(payload, {
      where: {
        id: payload.id,
        teacher_id: payload.teacher_id,
      },
    });

    return res.json({
      status: "Success",
      msg: "Data berhasil diperharui",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
      error: err,
    });
  }
};

module.exports = { listPrestasi, createPrestasi, updatePrestasi };

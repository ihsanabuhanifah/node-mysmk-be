const PelanggaranSiswaModel = require("../../models").pelanggaran_siswa;
const PelanggaranModel = require("../../models").pelanggaran;
const StudentModel = require("../../models").student;
const TeacherModel = require("../../models").teacher;
const TaModel = require("../../models").ta;
const models = require("../../models");
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");

const listPelanggaran = async (req, res) => {
  let { nama_siswa, pelapor, penindak, page, pageSize } = req.query;
  try {
    const pelanggaran = await PelanggaranSiswaModel.findAndCountAll({
      attributes: ["id", "tanggal", "status", "tindakan", "semester"],
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
          as: "pelaporan",
          attributes: ["id", "nama_guru"],
        },
        {
          model: TeacherModel,
          require: true,
          as: "penindakan",
          attributes: ["id", "nama_guru"],
        },
        {
          model: PelanggaranModel,
          require: true,
          as: "pelanggaran",
          attributes: ["id", "nama_pelanggaran", "tipe", "kategori", "point"],
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
const pelanggaran = async (req, res) => {
  let { nama_siswa, pelapor, penindak } = req.query;
  let { id: idSiswa } = req.params;

  try {
    const pelanggaran = await PelanggaranSiswaModel.findAndCountAll({
      attributes: ["id", "tanggal", "status", "tindakan", "semester"],
      include: [
        {
          model: StudentModel,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            id: idSiswa
          },
        },
        {
          model: TeacherModel,
          require: true,
          as: "pelaporan",
          attributes: ["id", "nama_guru"],
        },
        {
          model: TeacherModel,
          require: true,
          as: "penindakan",
          attributes: ["id", "nama_guru"],
        },
        {
          model: PelanggaranModel,
          require: true,
          as: "pelanggaran",
          attributes: ["id", "nama_pelanggaran", "tipe", "kategori", "point"],
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
const detailPelanggaran = async (req, res) => {
  let { id } = req.params;
  try {
    const pelanggaran = await PelanggaranSiswaModel.findOne({
      attributes: ["id", "tanggal", "status", "tindakan", "semester"],
      where: {
        id: id,
      },
      include: [
        {
          model: StudentModel,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
        },
        {
          model: TeacherModel,
          require: true,
          as: "pelaporan",
          attributes: ["id", "nama_guru"],
        },
        {
          model: TeacherModel,
          require: true,
          as: "penindakan",
          attributes: ["id", "nama_guru"],
        },
        {
          model: PelanggaranModel,
          require: true,
          as: "pelanggaran",
          attributes: ["id", "nama_pelanggaran", "tipe", "kategori"],
        },
        {
          model: TaModel,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
    });
    return res.json({
      status: "Success",
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

const deletePelanggaran = async (req, res) => {
  try {
    const { payload } = req.body;

    console.log("pau;ad", req.body);
    let count = 0;
    await Promise.all(
      payload.map(async (data) => {
        const hapus = await PelanggaranSiswaModel.destroy({
          where: {
            id: data,
          },
        });
        if (hapus) {
          count = count + 1;
        }
      })
    );

    return res.json({
      status: "Success",
      msg: `${count} data berhasil terhapus`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const createPelanggaran = async (req, res) => {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          const create = await PelanggaranSiswaModel.create({
            tanggal: data.tanggal,
            pelanggaran_id: data.pelanggaran_id,
            student_id: data.student_id,
            semester: data.semester,
            ta_id: data?.ta_id,
            pelapor: req.teacher_id,
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
const updatePelanggaran = async (req, res) => {
  try {
    const { payload } = req.body;
    payload.penindak = req.teacher_id;

    const update = await PelanggaranSiswaModel.update(payload, {
      where: {
        id: payload.id,
      },
    });

    if (update[0] === 0) {
      return res.json({
        status: "Fail",
        msg: "id pelanggaran tidak ditemukan",
      });
    }
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

module.exports = {
  listPelanggaran,
  detailPelanggaran,
  deletePelanggaran,
  createPelanggaran,
  updatePelanggaran,
  pelanggaran
};

const PelanggaranSiswaModel = require("../../models").pelanggaran_siswa;
const PelanggaranModel = require("../../models").pelanggaran;
const StudentModel = require("../../models").student;
const TeacherModel = require("../../models").teacher;
const TaModel = require("../../models").ta;
const models = require("../../models");
const { Op } = require("sequelize");

const listPelanggaran = async (req, res) => {
  let { namaSiswa, pelapor, penindak } = req.query;
  try {
    const pelanggaran = await PelanggaranSiswaModel.findAndCountAll({
      attributes: ["id", "tanggal", "status", "tindakan", "semester"],
      include: [
        {
          model: StudentModel,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: namaSiswa !== undefined ? { nama_siswa: namaSiswa } : {},
        },
        {
          model: TeacherModel,
          require: true,
          as: "pelaporan",
          attributes: ["id", "nama_guru"],
          where: pelapor !== undefined ? { nama_guru: pelapor } : {},
        },
        {
          model: TeacherModel,
          require: true,
          as: "penindakan",
          attributes: ["id", "nama_guru"],
          where: penindak !== undefined ? { nama_guru: penindak } : {},
        },
        {
          model: PelanggaranModel,
          require: true,
          as: "pelanggaran",
          attributes: ["id", "nama_pelanggaran", "tipe", "kategori"],
          where: penindak !== undefined ? { nama_guru: penindak } : {},
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
const detailPelanggaran = async (req, res) => {
  let {id} = req.params
  try {
    const pelanggaran = await PelanggaranSiswaModel.findAndCountAll({
      attributes: ["id", "tanggal", "status", "tindakan", "semester"],
      where : {
        id : id
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
  const { payload } = req.body;
  await PelanggaranSiswaModel.bulkCreate(payload);
  return res.status(201).json({
    status: "Success",
    msg: "Daftar Pelanggaran Siswa berhasil ditambahkan",
  });
};
const updatePelanggaran = async (req, res) => {
  res.send("update");
};

module.exports = {
  listPelanggaran,
  detailPelanggaran,
  deletePelanggaran,
  createPelanggaran,
  updatePelanggaran,
};

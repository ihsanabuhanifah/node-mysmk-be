const KelasStudentModel = require("../../models").kelas_student;
const models = require("../../models");
const { Op } = require("sequelize");

const { checkQuery } = require("../../utils/format");
const excel = require("exceljs");

async function listSiswa(req, res) {
  let {
    nama_kelas,
    nama_siswa,
    keyword,
    tahun_ajaran,
    status,
    page,
    pageSize,
  } = req.query;
  try {
    const siswa = await KelasStudentModel.findAndCountAll({
      where: {
        ...(checkQuery(status) && {
          status: status,
        }),
      },
      limit: pageSize,
      offset: page,
      include: [
        {
          model: models.kelas,
          require: true,
          as: "kelas",
          attributes: ["id", "nama_kelas"],
          where: {
            ...(checkQuery(nama_kelas) && {
              nama_kelas: {
                [Op.substring]: nama_kelas,
              },
            }),
          },
        },
        {
          model: models.student,
          require: true,
          as: "siswa",
          //   attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
            ...(checkQuery(keyword) && {
              nama_siswa: {
                [Op.substring]: keyword,
              },
            }),
          },
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
      msg: "Daftar Siswa ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: siswa,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function createSiswaKelas(req, res) {
  let { data } = req.body;
  try {
    await KelasStudentModel.bulkCreate(data);
    return res.json({
      status: "Success",
      msg: "Jadwal Berhasil ditambahkan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

const deleteSiswaKelas = async (req, res) => {
  try {
    const { id } = req.params;
    await KelasStudentModel.destroy({
      where: {
        id: id,
      },
    });

    return res.json({
      status: "Success",
      msg: `data berhasil terhapus`,
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
  listSiswa,
  createSiswaKelas,
  deleteSiswaKelas,
};

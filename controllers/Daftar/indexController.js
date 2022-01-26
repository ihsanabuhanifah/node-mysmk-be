const MapelModel = require("../../models").mapel;
const KelasModel = require("../../models").kelas;
const KelasSiswaModel = require("../../models").kelas_student;
const TahunAjaranModel = require("../../models").ta;
const GuruModel = require("../../models").teacher;
const RoleModel = require("../../models").role
const { sequelize } = require("../../models");
const { QueryTypes } = require("sequelize");
const listMapel = async (req, res) => {
  try {
    const mapel = await MapelModel.findAll({
      attributes: ["id", "nama_mapel", "kategori"],
    });

    return res.json({
      status: "Success",
      totalMapel: mapel.length,

      data: mapel,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const listGuru = async (req, res) => {
  
  try {
    const guru = await GuruModel.findAll({
      attributes : ['id' , 'nama_guru']
    });

    return res.json({
      status: "Success",
      totalMapel: guru.length,

      data: guru,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const listKelas = async (req, res) => {
  try {
    const kelas = await KelasModel.findAll({
      attributes: ["id", "nama_kelas"],
    });

    return res.json({
      status: "Success",
      totalMapel: kelas.length,

      data: kelas,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const listKelasSiswa = async (req, res) => {
  try {
    const kelas = await sequelize.query(
      `SELECT
      a.id,
      b.id AS student_id,
      a.kelas_id,
      b.nama_siswa,
      c.nama_kelas,
      a.semester,
      d.nama_tahun_ajaran AS tahun_ajaran,
      a.status
    FROM
      kelas_students AS a
      LEFT JOIN students AS b ON (a.student_id = b.id)
      LEFT JOIN kelas AS c ON (a.kelas_id = c.id)
      LEFT JOIN ta AS d ON (a.ta_id = d.id)
    WHERE
      a.status = 1
      `,
      {
        type: QueryTypes.SELECT,
      }
    );

    return res.json({
      status: "Success",
      totalMapel: kelas.length,

      data: kelas,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const listTahunAjaran = async (req, res) => {
  try {
    const tahun_ajaran = await TahunAjaranModel.findAll({
      attributes: ["id", "nama_tahun_ajaran"],
    });

    return res.json({
      status: "Success",
      totalMapel: tahun_ajaran.length,

      data: tahun_ajaran,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const listRole = async (req, res) => {
  try {
    const role = await RoleModel.findAll({
      attributes : ["id" , 'role_name' , 'remarks']
    });

    return res.json({
      status: "Success",
      totalMapel: role.length,

      data: role,
    });
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
module.exports = {
  listMapel,
  listKelas,
  listKelasSiswa,
  listTahunAjaran,
  listGuru,
  listRole
};

// Data referensi (ID) untuk mengisi template import Excel
const models = require("../../models");

async function referensiImport(req, res) {
  try {
    const [roles, ta, kelas, mapel, guru, siswa, alquran] = await Promise.all([
      models.role.findAll({
        attributes: ["id", "role_name"],
        order: [["id", "ASC"]],
      }),
      models.ta.findAll({
        attributes: ["id", "nama_tahun_ajaran"],
        order: [["id", "ASC"]],
      }),
      models.kelas.findAll({
        attributes: ["id", "nama_kelas", "tahun_ajaran"],
        order: [["id", "ASC"]],
      }),
      models.mapel.findAll({
        attributes: ["id", "nama_mapel", "kategori"],
        order: [["id", "ASC"]],
      }),
      models.teacher.findAll({
        attributes: ["id", "nama_guru"],
        order: [["nama_guru", "ASC"]],
      }),
      models.student.findAll({
        attributes: ["id", "nama_siswa", "nis", "nisn", "angkatan"],
        order: [["nama_siswa", "ASC"]],
      }),
      models.alquran.max("id"),
    ]);

    return res.json({
      status: "Success",
      data: {
        roles,
        ta,
        kelas,
        mapel,
        guru,
        siswa,
        alquranMaxId: alquran || 0,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

module.exports = { referensiImport };

const studentModel = require("../../models").student;
const models = require("../../models");

const profile = async (req, res) => {
  
  try {
    const siswa = await studentModel.findAll({
      where: {
        user_id: req.student_id, //ambil dari token
      },
      include: [
        {
          model: models.parent,
          require: true,
          as: "parent",
          attributes: ["id", "nama_wali"],
        },
      ],
    });

    return res.json({
      siswa,
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({
      msg: "Terjadi Kesalahan",
    });
  }
  res.json({
    status: "ok",
  });
};

const updateSiswa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_siswa,
      nik,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      sekolah_asal,
      jenis_kelamin,
      anak_ke,
    } = req.body;

    const detail = await studentModel.findOne({
      where: {
        id,
      },
    });
    if (!detail) {
      return res.json({
        status: "Success",
        msg: "Santri tidak ditemukan",
        data: detail,
      });
    }

    const fieldsToUpdate = {};

    if (nama_siswa) fieldsToUpdate.nama_siswa = nama_siswa;
    if (nik) fieldsToUpdate.nik = nik;
    if (tempat_lahir) fieldsToUpdate.tempat_lahir = tempat_lahir;
    if (tanggal_lahir) fieldsToUpdate.tanggal_lahir = tanggal_lahir;
    if (alamat) fieldsToUpdate.alamat = alamat;
    if (sekolah_asal) fieldsToUpdate.sekolah_asal = sekolah_asal;
    if (jenis_kelamin) fieldsToUpdate.jenis_kelamin = jenis_kelamin;
    if (anak_ke) fieldsToUpdate.anak_ke = anak_ke;

    if (Object.keys(fieldsToUpdate).length > 0) {
      await studentModel.update(fieldsToUpdate, {
        where: { id },
      });

      return res.json({
        status: "Success",
        msg: "Data berhasil di update",
      });
    } else {
      return res.json({
        status: "No Change",
        msg: "Tidak ada data yang diperbarui",
      });
    }
  } catch (err) {
    return res.status(403).send("Ada Kesalahan");
  }
};

module.exports = { profile, updateSiswa };

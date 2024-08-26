const info_calsan = require("../../models").informasi_calon_santri;

const createInfoCalsan = async (req, res) => {
  try {
    const {
      nama_siswa,
      nis,
      nisn,
      nik,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      sekolah_asal,
      jenis_kelamin,
      anak_ke,
      nama_ayah,
      nama_ibu,
      pekerjaan_ayah,
      pekerjaan_ibu,
      nama_wali,
      pekerjaan_wali,
      hubungan,
      kk,
      ijazah,
      akte,
      skb,
    } = req.body;

    const user_id = req.id;

    const newInfoCalsan = await info_calsan.create({
      user_id,
      nama_siswa,
      nis,
      nisn,
      nik,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      sekolah_asal,
      jenis_kelamin,
      anak_ke,
      nama_ayah,
      nama_ibu,
      pekerjaan_ayah,
      pekerjaan_ibu,
      nama_wali,
      pekerjaan_wali,
      hubungan,
      kk,
      ijazah,
      akte,
      skb,
    });

    console.log(user_id);
    console.log("req.user_id:", req.id);
    res.status(201).json({
      message: "Informasi calon santri berhasil dibuat",
      data: newInfoCalsan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const updateInfoCalsan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_siswa,
      nis,
      nisn,
      nik,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      sekolah_asal,
      jenis_kelamin,
      anak_ke,
      nama_ayah,
      nama_ibu,
      pekerjaan_ayah,
      pekerjaan_ibu,
      nama_wali,
      pekerjaan_wali,
      hubungan,
      kk,
      ijazah,
      akte,
      skb,
      surat_pernyataan,
    } = req.body;

    const user_id = req.id;
    console.log(`user_id:`, req.id);
    const detail = await info_calsan.findOne({
      where: {
        id,
      },
    });
    if (!detail) {
      return res.status(404).json({
        status: "fail",
        msg: "Data tidak ditemukan",
      });
    }

    const fieldsToUpdate = {};
    if (nama_siswa !== undefined) fieldsToUpdate.nama_siswa = nama_siswa;
    if (nis !== undefined) fieldsToUpdate.nis = nis;
    if (nisn !== undefined) fieldsToUpdate.nisn = nisn;
    if (nik !== undefined) fieldsToUpdate.nik = nik;
    if (tempat_lahir !== undefined) fieldsToUpdate.tempat_lahir = tempat_lahir;
    if (tanggal_lahir !== undefined)
      fieldsToUpdate.tanggal_lahir = tanggal_lahir;
    if (alamat !== undefined) fieldsToUpdate.alamat = alamat;
    if (sekolah_asal !== undefined) fieldsToUpdate.sekolah_asal = sekolah_asal;
    if (jenis_kelamin !== undefined)
      fieldsToUpdate.jenis_kelamin = jenis_kelamin;
    if (anak_ke !== undefined) fieldsToUpdate.anak_ke = anak_ke;
    if (nama_ayah !== undefined) fieldsToUpdate.nama_ayah = nama_ayah;
    if (nama_ibu !== undefined) fieldsToUpdate.nama_ibu = nama_ibu;
    if (pekerjaan_ayah !== undefined)
      fieldsToUpdate.pekerjaan_ayah = pekerjaan_ayah;
    if (pekerjaan_ibu !== undefined)
      fieldsToUpdate.pekerjaan_ibu = pekerjaan_ibu;
    if (nama_wali !== undefined) fieldsToUpdate.nama_wali = nama_wali;
    if (pekerjaan_wali !== undefined)
      fieldsToUpdate.pekerjaan_wali = pekerjaan_wali;
    if (hubungan !== undefined) fieldsToUpdate.hubungan = hubungan;
    if (kk !== undefined) fieldsToUpdate.kk = kk;
    if (ijazah !== undefined) fieldsToUpdate.ijazah = ijazah;
    if (akte !== undefined) fieldsToUpdate.akte = akte;
    if (skb !== undefined) fieldsToUpdate.skb = skb;
    if (surat_pernyataan !== undefined)
      fieldsToUpdate.surat_pernyataan = surat_pernyataan;

    if (Object.keys(fieldsToUpdate).length > 0) {
      await info_calsan.update(fieldsToUpdate, {
        where: { id },
      });

      return res.json({
        status: "Success",
        msg: "Data berhasil di update",
        data: fieldsToUpdate,
      });
    } else {
      return res.json({
        status: "No Change",
        msg: "Tidak ada data yang diperbarui",
      });
    }

    if (Object.keys(fieldsToUpdate).length > 0) {
      await info_calsan.update(fieldsToUpdate, {
        where: { id },
      });

      return res.json({
        status: "Success",
        msg: "Data berhasil di update",
        data: fieldsToUpdate,
      });
    } else {
      return res.json({
        status: "No Change",
        msg: "Tidak ada data yang diperbarui",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const getDetailCalsan = async (req, res) => {
  try {
    const user_id = req.id;
    console.log(`user_id:`, req.id);

    const detail = await info_calsan.findOne({
      where: { user_id },
    });

    if (!detail) {
      return res.status(404).json({
        status: "fail",
        msg: "Data tidak ditemukan",
      });
    }

    return res.json({
      status: "Success",
      data: detail,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const detailCalsan = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await info_calsan.findByPk(id);
    if (!detail) {
      return res.status(404).send({
        status: "fail",
        message: "Data tidak ditemukan",
      });
    }
    res.status(200).send({
      status: "success",
      data: detail,
    });
  } catch {}
};

module.exports = {
  createInfoCalsan,
  updateInfoCalsan,
  getDetailCalsan,
  detailCalsan,
};

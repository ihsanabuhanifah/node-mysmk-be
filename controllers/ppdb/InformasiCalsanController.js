const info_calsan = require("../../models").informasi_calon_santri;
const models = require("../../models");

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
      ta_id = 4,
      exam,
      status_ujian,
    } = req.body;

    const user_id = req.id;
    const examJson = JSON.stringify(exam);

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
      ta_id,
      exam: examJson,
      status_ujian,
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
      exam,
      ta_id,
      status_ujian,
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
    if (exam !== undefined) fieldsToUpdate.exam = JSON.stringify(exam);

    if (ta_id !== undefined) fieldsToUpdate.ta_id = ta_id;
    if (status_ujian !== undefined) fieldsToUpdate.status_ujian = status_ujian;
    if (Object.keys(fieldsToUpdate).length > 0) {
      await info_calsan.update(fieldsToUpdate, {
        where: { id },
      });

      res.status(200).send({
        status: "success",
        msg: "Informasi calon santri berhasil diupdate",
        data: fieldsToUpdate,
      });
    } else {
      res.status(200).send({
        status: "success",
        msg: "Tidak ada data yang di update",
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
      include: [
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      order: [["id", "ASC"]],
    });

    if (!detail) {
      return res.status(404).json({
        status: "fail",
        msg: "Data tidak ditemukan",
      });
    }

    const parsedDetail = {
      ...detail.toJSON(),
      exam: detail.exam ? JSON.parse(detail.exam) : null,
    };

    res.status(200).send({
      status: "success",
      data: parsedDetail,
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
  } catch {
    return res.status(500).send({
      status: "fail",
      message: "Terjadi kesalahan",
    });
  }
};

const listCalonSantri = async (req, res) => {
  const { page, pageSize } = req.query;
  try {
    const list = await info_calsan.findAndCountAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      include: [
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      order: ["id"],
    });
    if (list.length === 0) {
      return res.json({
        status: "Success",
        msg: "Tidak ditemukan data",
        data: list,
      });
    }
    return res.json({
      status: "Success",
      msg: "Berhasil Menemukan data!",
      data: list,
      offset: page,
      limit: pageSize,
    });
  } catch (error) {
    console.log(error);
    res.status(403).send("Terjadi Kesalahan");
  }
};

module.exports = {
  createInfoCalsan,
  updateInfoCalsan,
  getDetailCalsan,
  detailCalsan,
  listCalonSantri,
};

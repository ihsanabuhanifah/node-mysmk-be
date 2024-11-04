const info_calsan = require("../../models").informasi_calon_santri;
const { where, Op } = require("sequelize");
const models = require("../../models");
const listCalonSantri = async (req, res) => {
  const { page, pageSize, nama_siswa, tahun_ajaran, sekolah_asal } = req.query;
  try {
    const list = await info_calsan.findAndCountAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      where: {
        ...(nama_siswa && {
          nama_siswa: { [Op.like]: `%${nama_siswa.toLowerCase()}%` },
        }),
        ...(sekolah_asal && {
          sekolah_asal: { [Op.like]: `%${sekolah_asal.toLowerCase()}%` },
        }),
      },
      include: [
        {
          model: models.ta,
          required: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
          where: {
            ...(tahun_ajaran && {
              nama_tahun_ajaran: {
                [Op.like]: `%${tahun_ajaran.toLowerCase()}%`,
              },
            }),
          },
        },
        {
          model: models.wawancara,
          required: true,
          as: "wawancara",
          attributes: ["id", "status_tes", "is_lulus", "is_batal"],
        },
      ],
      order: [["id", "ASC"]],
    });
    if (list.rows.length === 0) {
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
  listCalonSantri,
};

const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const models = require("../../models");
const pembayaranPpdb = require("../../models").pembayaran_ppdb;

const createPembayaran = async (req, res) => {
  try {
    const { bukti_tf, nominal, teacher_id, keterangan } = req.body;
    const user_id = req.id;

    const bayar = await pembayaranPpdb.create({
      user_id,
      bukti_tf,
      nominal,
      teacher_id,
      keterangan,
    });

    return res.status(201).json({
      message: "Berhasil Bayar!",
      data: bayar,
    });
  } catch (error) {
    console.error("Error create pembayaran PPDB:", error);
    return res.status(500).json({
      message: "Ada kesalahan",
      error: error.message,
    });
  }
};

const getDetailPembayaran = async (req, res) => {
  try {
    const user_id = req.id;

    const pembayaran = await pembayaranPpdb.findOne({
      where: { user_id },
      include: [
        {
          model: models.teacher,
          required: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.user,
          required: true,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    if (!pembayaran) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan.",
      });
    }

    return res.status(200).json({
      message: "Detail Pembayaran",
      data: pembayaran,
    });
  } catch (error) {
    console.error("Error mendapatkan pembayaran PPDB detail:", error);
    return res.status(500).json({
      message: "Ada kesalahan",
      error: error.message,
    });
  }
};

const listPembayaran = async (req, res) => {
  const { page, pageSize } = req.query;
  try {
    const list = await pembayaranPpdb.findAndCountAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      include: [
        {
          model: models.teacher,
          required: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.user,
          required: true,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });
    if (list.length === 0) {
      return res.json({
        status: "Success",
        msg: "Tidak ditemukan perizinan",
        data: list,
      });
    }
    return res.json({
      status: "Success",
      msg: "Berhasil Menemukan pembayaran!",
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
  createPembayaran,
  getDetailPembayaran,
  listPembayaran,
};

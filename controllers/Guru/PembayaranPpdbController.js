const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const pembayaranPpdb = require("../../models").pembayaran_ppdb;
const models = require("../../models");

const updatePembayaranPpdb = async (req, res) => {
  try {
    const { id } = req.params;
    const { nominal, teacher_id, keterangan } = req.body;

    const pembayaran = await pembayaranPpdb.findOne({ where: { id } });

    if (!pembayaran) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan.",
      });
    }

    await pembayaran.update({
      nominal,
      teacher_id,
      keterangan,
    });

    return res.status(200).json({
      message: "Pembayaran berhasil diupdate!",
      data: pembayaran,
    });
  } catch (error) {
    console.error("Error update pembayaran PPDB:", error);
    return res.status(500).json({
      message: "Ada kesalahan",
      error: error.message,
    });
  }
};

const deletePembayaranPpdb = async (req, res) => {
  try {
    const { id } = req.params;

    const pembayaran = await pembayaranPpdb.findOne({ where: { id } });
    if (!pembayaran) {
      return res.status(404).json({
        status: "Fail",
        message: "Pembayaran tidak ditemukan.",
      });
    }

    await pembayaran.destroy();

    return res.status(200).json({
      status: "Success",
      message: `Pembayaran dengan ID ${id} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Error menghapus pembayaran PPDB:", error);
    return res.status(500).json({
      status: "Error",
      message: "Terjadi kesalahan saat menghapus pembayaran.",
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
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.user,
          required: true,
          as: "user",
          attributes: ["name"],
        },
      ],
      order: ["id"],
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
const konfirmasiPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pembayaran = await pembayaranPpdb.findOne({ where: { id } });

    if (!pembayaran) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan.",
      });
    }

    if (status !== undefined && (status === 0 || status === 1)) {
      pembayaran.status = status;
      await pembayaran.save();

      return res.status(200).json({
        message: "Pembayaran berhasil dikonfirmasi.",
        data: pembayaran,
      });
    } else {
      return res.status(400).json({
        message: "Status yang diberikan tidak valid. Gunakan 0 atau 1.",
      });
    }
  } catch (error) {
    console.error("Error konfirmasi pembayaran:", error);
    return res.status(500).json({
      message: "Ada kesalahan",
      error: error.message,
    });
  }
};
module.exports = {
  updatePembayaranPpdb,
  listPembayaran,
  konfirmasiPembayaran,
  deletePembayaranPpdb
};

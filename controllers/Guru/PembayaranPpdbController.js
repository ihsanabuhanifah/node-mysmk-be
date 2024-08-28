const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const pembayaranPpdb = require("../../models").pembayaran_ppdb;
const models = require("../../models");

const updatePembayaranPpdb = response.requestResponse(async (req, res) => {
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
      message: "ada kesalahan",
      error: error.message,
    });
  }
});
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
module.exports = {
  updatePembayaranPpdb,
  listPembayaran,
};

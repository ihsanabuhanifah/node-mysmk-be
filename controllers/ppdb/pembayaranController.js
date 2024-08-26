const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();

const pembayaranPpdb = require("../../models").pembayaran_ppdb;

const createPembayaran = response.requestResponse(async (req, res) => {
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
    console.error("Error creating pembayaran PPDB:", error);
    return res.status(500).json({
      message: "An error occurred while creating pembayaran PPDB",
      error: error.message,
    });
  }
});
const getDetailPembayaran = response.requestResponse(async (req, res) => {
  try {
    const { id } = req.params;
    const pembayaran = await pembayaranPpdb.findOne({ where: { id } });
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
    console.error("Error retrieving pembayaran PPDB detail:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving pembayaran PPDB detail",
      error: error.message,
    });
  }
});
module.exports = {
  createPembayaran,
  getDetailPembayaran,
};

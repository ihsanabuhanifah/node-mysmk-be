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
module.exports = {
  createPembayaran,
};

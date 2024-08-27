const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const pembayaranPpdb = require("../../models").pembayaran_ppdb;

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
    console.error("Error updating pembayaran PPDB:", error);
    return res.status(500).json({
      message: "An error occurred while updating pembayaran PPDB",
      error: error.message,
    });
  }
});

module.exports = {
  updatePembayaranPpdb,
};

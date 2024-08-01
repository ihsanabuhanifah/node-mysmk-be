const PembayaranModel = require("../../models").pembayaran_spp;

const createPembayaran = async (req, res) => {

try {
    const payload = req.body;
    

    return res.status(201).json({
        status: "Success",
        msg: "Berhasil Mengirim Pembayaran"
    })
} catch (error) {
    console.log(err);
    return res.status(403).send("Terjadi Kesalahan Dalam Pembayaran")
}
}


module.exports = {createPembayaran}
const PembayaranController = require("../../models").pembayaran_spp;
const models = require('../../models')

const createPembayaran = async (req, res) => {

try {
    const payload = req.body;
    
    const buat = await PembayaranController.create({
        ...payload,
        walsan_id: req.walsan_id,
        user_id: req.user_id
    })

    return res.status(201).json({
        status: "Success",
        msg: "Berhasil Mengirim Pembayaran",
        data: buat
    })
} catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan Dalam Pembayaran")
}
}

const detailPembayaran = async (req, res) => {
    try {
        const {id} = req.params;

        const pembayaran = await PembayaranController.findOne({
            where: {id: id}, 
            include: [
                {
                    model: models.parent,
                    require: true,
                    as: "parent",
                    attributes: ["id", "nama_wali"]
                },
                {
                    model: models.user,
                    require: true,
                    as: "user",
                    attributes: ["id", "email"]
                }
            ]
        })

        return res.json({
            status: "Success",
            msg: "Berhasil Menampilkan Detail Pembayaran",
            data: pembayaran
        })
    } catch (error) {
        console.log(error);
        return res.status(403).json({
            status: "Gawat",
            msg: "Terjadi Kesalahan"
        })
    }
}


module.exports = {createPembayaran}
const PembayaranController = require("../../models").pembayaran_spp;
const models = require("../../models");
const cron = require("node-cron")

const createPembayaran = async (req, res) => {
  try {
    const payload = req.body;

    payload.status = "Belum Valid";

    const buat = await PembayaranController.create({
      ...payload,
      walsan_id: req.walsan_id,
      user_id: req.user_id,
    });

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Mengirim Pembayaran",
      data: buat,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan Dalam Pembayaran");
  }
};

const detailPembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    const pembayaran = await PembayaranController.findOne({
      where: {
         id: id,
        user_id: req.user_id
       },
      include: [
        {
          model: models.parent,
          require: true,
          as: "parent",
          attributes: ["id", "nama_wali"],
        },
        {
          model: models.user,
          require: true,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "Berhasil Menampilkan Detail Pembayaran",
      data: pembayaran,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan")
  }
};

const ListPembayaran = async (req, res) => {
  const { page, pageSize } = req.query;

  try {
    const list = await PembayaranController.findAndCountAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
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
        msg: "Berhasil Menemukan Pembayaran",
        data: list,
        offset: page,
        limit: pageSize
    })
  } catch (error) {
    console.log(error);
    res.status(403).send("Terjadi Kesalahan");
  }
};

async function updatePembayaran (req, res) {
    try {
        const {id} = req.params;
        const {payload} = req.body;

        const detail = await PembayaranController.findOne({
            where: {
                id: id,
                user_id: req.user_id
            },

        });

        if (!detail) {
            return res.json({
                status: "Pembayaran Belum Ditemukan"
            })
        }

        const proses = await PembayaranController.update({
            payload
        }, {
            where: {
                id:id
            }
        });

        return res.json({
            status: "Success",
            msg: "Berhasil Memperbarui Pembayaran",
            data: proses
        })
    } catch (error) {
        console.log(error);
        return res.status(403).send("Terjadi Kesalahan")
    }
    


}

async function resetPerbulan () {
  try {
    await PembayaranController.destroy({where: {}})
    console.log("Berhasil")
  } catch (error) {
    console.log(error)
    return res.status(403).send("Terjadi Kesalahan")
  }
}

cron.require("0 0 10 * *", resetPerbulan)

module.exports = { createPembayaran, detailPembayaran, ListPembayaran, updatePembayaran, resetPerbulan };

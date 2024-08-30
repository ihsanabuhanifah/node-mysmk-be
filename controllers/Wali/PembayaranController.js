const PembayaranController = require("../../models").pembayaran_spp;
const models = require("../../models");
const pembayaranModel = require("../../models").pembayaran_spp;
const cron = require("node-cron")
const midtrans = require("midtrans-client");
const {format, parse, eachMonthOfInterval} = require("date-fns");
const { param } = require("express-validator");
const userModel = require("../../models").user;

let snap = new midtrans.Snap({
  isProduction: false,
  serverKey: ''
})



const createKartuSpp = async (req, res) => {
  try {

    const {payload} = req.body;

    let gagal = 0;
    let berhasil = 0;

    if (!Array.isArray(payload)) {
      return res.status(400).json({
        status: "Fail",
        msg: "Invalid payload format. Payload should be an array.",
      });
    }

    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    await Promise.all(
      payload.map(async (item) => {
        try {
          const bulan = months.map((month) => ({
            student_id: item.student_id,
            ta_id : item.ta_id,
            nominal: item.nominal,
            status: "Belum",
            bulan: month
          }))

          console.log("gagal = ",bulan)

          const buat = await PembayaranController.bulkCreate(bulan);

          

          if (buat) {
            berhasil = berhasil + 1;
          } else {
            console.log("Error:",item);
            gagal = gagal + 1;
          }
        } catch (error) {
          console.log(item, "Error :", error)
          gagal = gagal + 1;
          
        }
      })
    )
     
    

    return res.status(201).json({
      status: "Success",
      berhasil,
      gagal,
      msg: `Berhasil Membuat Kartu Pembayaran Sebanyak ${berhasil} kali dan Gagal Sebanyak ${gagal} kali`,
      data: payload
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan Dalam Pembayaran")
}
}

const detailPembayaran = async (req, res) => {
    try {
        const {id} = req.params;

    const pembayaran = await PembayaranController.findOne({
      where: {
         id: id
       },
      include: [
        {
          model: models.parent,
          require: true,
          as: "walsan",
          attributes: ["id", "nama_wali"],
        },
        {
          model: models.student,
          require: true,
          as: "murid",
          attributes: ["id", "nama_siswa"],
        },
        {
          model: models.ta,
          require: true,
          as: "ta",
          attributes: ["id", "nama_tahun_ajaran"],
        },
        {
          model: models.teacher,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru", "status"]
        }
      ],

      order: ["id"]
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
          as: "walsan",
          attributes: ["id", "nama_wali"],
        },
        {
          model: models.student,
          require: true,
          as: "murid",
          attributes: ["id", "nama_siswa"],
        },
        {
          model: models.ta,
          require: true,
          as: "ta",
          attributes: ["id", "nama_tahun_ajaran"],
        },
        {
          model: models.teacher,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru", "status"]
        }
      ],
      order: ["id","student_id"],

      
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

async function createPembayaran (req, res) {
    try {
        const {id} = req.params;
        const {walsan_id, foto} = req.body;

        const detail = await PembayaranController.findOne({
            where: {
                id: id,
            },

        });

        if (!detail) {
            return res.json({
                status: "Kartu Santri Belum Ditambahkan"
            })
        }

        const proses = await PembayaranController.update({
        walsan_id: walsan_id,
        foto: foto
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


async function updateAprroval (req, res) {
  try {
    const {id} = req.params;
    const {tanggal_konfirmasi, teacher_id} = req.body;

    const detail = await PembayaranController.findOne({
      where: {
        id: id,
      }
    })

    if (!detail) {
      console.log(id)
      console.log(detail)
      return res.json({status: "Belum Menemukan Kartu Pembayaran"})
    }

     // Custom date string (in the format "12 August 2024")
     const customDateString = format(new Date(), 'dd MMMM yyyy'); // Adjust as needed
     console.log("Formatted Date:", customDateString);
 
     // Parse the date string into a Date object
     const parsedDate = parse(customDateString, 'dd MMMM yyyy', new Date());

   await PembayaranController.update({
      teacher_id: req.teacher_id,
      status: "Sudah",
      tanggal_konfirmasi: parsedDate
    },
    {
      where: {
        id: id
      }
    }
  )


    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menyetujui Pembayaran",
      data: detail
    })

  } catch (error) {
    console.log(error)
    return res.status(403).send("Terjadi Kesalahan")
  }
}

async function createPembayaranOtomatis (req, res) {
  try {

    const user = await userModel.findOne({
      where: {
        id : req.id
      }
    })

    const {nominal, walsan_id, no_telepon} = req.body

    let parameter = {
      transaction_details : {
        order_id : "PCX-123",
        gross_amount : nominal
      },
      credit_card: {
        secure : true
      },
      customer_details: {
        email: user.email,
        first_name: "Santri",
        last_name: "MQ",
        phone: no_telepon
      }
    }

    snap.createTransaction(parameter).then((transaksi) => {
      let tokenTransaksi = transaksi.token;
      console.log("Transaksi Token: ", tokenTransaksi)
    })
  } catch (error) {
    console.log(error)
    return res.status(403).send("Terjadi Kesalahan")
  }
}

// async function resetPerbulan () {
//   try {
//     await PembayaranController.destroy({where: {}})
//     console.log("Berhasil")
//   } catch (error) {
//     console.log(error)
//     return res.status(403).send("Terjadi Kesalahan")
//   }
// }

module.exports = { createKartuSpp, detailPembayaran, ListPembayaran, createPembayaran, updateAprroval};



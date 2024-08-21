const PembayaranController = require("../../models").pembayaran_spp;
const models = require("../../models");
const pembayaranModel = require("../../models").pembayaran_spp;
const cron = require("node-cron");
const midtrans = require("midtrans-client");
const { format, parse, eachMonthOfInterval } = require("date-fns");
const { param } = require("express-validator");
const { checkQuery } = require("../../utils/format");
const userModel = require("../../models").user;
const notificationModel = require("../../models").notification;
const studentModel = require("../../models").student;
const parentModel = require("../../models").parent;
const {Op} = require("sequelize");
const axios = require('axios');
require("dotenv").config();



let snap = new midtrans.Snap({
  isProduction: false,
  serverKey: "",
});

const Monthmap = {
  'Juli': 1,
    'Agustus': 2,
    'September': 3,
    'Oktober': 4,
    'November': 5,
    'Desemeber': 6,
    'Januari': 7,
    'Februari': 8,
    'Maret': 9,
    'April': 10,
    'Mei': 11,
    'Juni': 12,
    };

const createKartuSpp = async (req, res) => {
  try {
    const { payload } = req.body;

    let gagal = 0;
    let berhasil = 0;

    // Check if payload is an array
    if (!Array.isArray(payload)) {
      return res.status(400).json({
        status: "Fail",
        msg: "Invalid payload format. Payload should be an array.",
      });
    }

    const months = [
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
    ];

    let newRecords = [];

    // Process each item in the payload
    await Promise.all(
      payload.map(async (item) => {
        try {
         if (item.student_id === null && item.ta_id === null) {
          console.log("Barang ID_siswa Dan ID_TA Tidak Ada")
          gagal += 1
          return;
         }

         const cari = await pembayaranModel.findOne({
          where: {
            student_id: item.student_id,
            ta_id: item.ta_id
          }
         })

         if (cari) {
          console.log(`Data Yang Sudah Ada: id_siswa:${item.student_id} dan id_ta: ${item.ta_id}`);
          gagal +=1;
         } else {
          const recordsForMonths = months.map((month, index) => {
            const year = index < 6 ? 2024 : 2025;

            return {
              student_id: item.student_id,
              ta_id: item.ta_id,
              nominal: item.nominal,
              walsan_id: item.walsan_id,
              status: "Belum",
              bulan: month,
              tahun: year,
              tanggal: new Date(),
            };
          });

          newRecords = newRecords.concat(recordsForMonths);
          berhasil += 1;
         }

        } catch (error) {
          console.log(item, "Error:", error);
          gagal += 1;
        }
      })
    );

    if (newRecords.length > 0) {
      await pembayaranModel.bulkCreate(newRecords);
    }

    console.log("Barang Baru:", newRecords);


    return res.status(201).json({
      status: "Success",
      berhasil,
      gagal,
      msg: `Berhasil Membuat Kartu Pembayaran Sebanyak ${berhasil} kali dan Gagal Sebanyak ${gagal} kali`,
      data: newRecords,
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
          attributes: ["id", "nama_guru", "status"],
        },
      
      ],

      order: ["id"],
    });

    return res.json({
      status: "Success",
      msg: "Berhasil Menampilkan Detail Pembayaran",
      data: pembayaran,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan");
  }
};

const ListPembayaran = async (req, res) => {




  try {
    const { page, pageSize, nama_siswa, dari_tahun, ke_tahun, dari_bulan, ke_bulan, tahun, bulan} = req.query;

    let Result = {};



    const dariBulan = dari_bulan ? Monthmap[dari_bulan] : null;
    
    const keBulan = ke_bulan ? Monthmap[ke_bulan] : null;
  
    console.log("Dari Bulan :", dariBulan);
    console.log("Ke Bulan:", keBulan)
    
  
    if (dari_bulan && ke_bulan) {
    Result = {
      bulan: {
        [Op.or] : [
          {[Op.eq]: dari_bulan},
          {[Op.eq] : ke_bulan},
          {
            [Op.and] : [
              {[Op.gte] : dari_bulan},
              {
              [Op.lte] : ke_bulan
              }
            ]
          }
        ]
      }
    }
    } else if (dari_bulan) {
      Result = {
        bulan: {
          [Op.substring] : dari_bulan
        }
      }
    } else if (ke_bulan) {
      Result = {
        bulan : {
          [Op.substring] : ke_bulan
        }
      }
      
    }
  
    if (dari_tahun && ke_tahun) {
      Result = {
        tahun : {
          [Op.between] : [dari_tahun, ke_tahun]
        }
      }
    }

    if (bulan) {
      Result.bulan = {
        [Op.substring] : bulan
      }
    }

    if (tahun) {
      Result.tahun = {
        [Op.substring] : tahun 
      }
    }

    const list = await PembayaranController.findAndCountAll({
  limit: pageSize,
  offset: page,
  where: Result,
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
          where: {
            ...(checkQuery(nama_siswa)) && {
              nama_siswa: {[Op.substring] : nama_siswa}
            }
          }
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
          attributes: ["id", "nama_guru", "status"],
        }
      ],
      order: ["id", "student_id"],
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
      limit: pageSize,
    });
  } catch (error) {
    console.log(error);
    res.status(403).send("Terjadi Kesalahan");
  }
};

async function createPembayaran(req, res) {
  try {
    const { id } = req.params;
    const { foto } = req.body;

    const detail = await PembayaranController.findOne({
      where: {
        id: id,
      },
    });

    if (!detail) {
      return res.json({
        status: "Kartu Santri Belum Ditambahkan",
      });
    }

    const proses = await PembayaranController.update(
      {
        foto: foto,
        tanggal: new Date(),
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.json({
      status: "Success",
      msg: "Berhasil Memperbarui Pembayaran",
      data: proses,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}


async function createPembayaranOtomatis(req, res) {
  try {
    const user = await userModel.findOne({
      where: {
        id: req.id,
      },
    });

    const dataUpdate = await PembayaranController.findOne({
      where: {
        id: id,
      },
    });

    const { nominal, walsan_id, no_telepon } = req.body;

    let parameter = {
      transaction_details: {
        order_id: "PCX-123",
        gross_amount: nominal,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        email: user.email,
        first_name: "Santri",
        last_name: "MQ",
        phone: no_telepon,
      },
    };

    snap.createTransaction(parameter).then((transaksi) => {
      let tokenTransaksi = transaksi.token;
      console.log("Transaksi Token: ", tokenTransaksi);
    });

    await PembayaranController.update(
      {
        walsan_id: walsan_id,
        no_telepon: no_telepon,
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.status(201).json({
      status: "Success",
      msg: "Berhail Membayar SPP",
      token: tokenTransaksi,
      data: dataUpdate,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}

async function createNotification(req, res) {
  // try {
    // const walsan = await parentModel.findOne({
    //   where: {
    //     id: id
    //   }
    // })
    console.log("WABLAS", process.env.WABLAS_TOKEN);

    const token = `${process.env.WABLAS_TOKEN}`

    const { tanggal, isi_pesan } = req.body; 

    const data =  {
      phone: '6285794120637',
      message: isi_pesan
    }


    const response = await axios.post('https://jogja.wablas.com/api/send-message', data, {
      headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
      }
    })
    // console.log('Notification sent:', response.data);

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menambahkan Pesan",
    });
  // } catch (error) {
  //   console.log(error.response ? error.response.data : error.message);
  //   return res.status(403).send("Terjadi Kesalahan");
  // }
}



async function daftarSiswa(req, res) {
  const {page, pageSize, angkatan, tahun_ajaran, status, nama_siswa} = req.query;
  try {
    const cari = await studentModel.findAndCountAll({
      limit: pageSize,
      offset: page,
      where: {
        ...(checkQuery(angkatan) && {
          angkatan: {[Op.like]: "%angkatan%"}
        })
      },
      include: [
        {
          model: models.student,
          as: "siswa",
          require: true,
          where: {
            ...(checkQuery(nama_siswa) && {
            nama_siswa:{
            [Op.substring] : nama_siswa
            }
            })
          }
        },
        {
          model : models.ta,
          require: true,
          attributes: ["id", "nama_tahun_ajaran"],
          as: "tahun_ajaran",
          where: {
            ...(checkQuery(tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring] : tahun_ajaran
              }
            })
          }
        }
      ]
    })


    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menampilkan Siswa",
      data: cari
    })

  } catch (error) {
    console.log(error)
    return res.status(403).json({
      status: "Failed",
      msg: "Terjadi Kesalahan"
    })
  }
}

async function detailPembayaranSiswa (req, res) {
  try {
    const {student_id} = req.params;
    const {page, pageSize} = req.query;

    const cari = await PembayaranController.findAndCountAll({
      where: {
        student_id: student_id
      },
      limit: pageSize,
      offset: page,
      order: ["id",
        ["bulan", "ASC"]
      ]
    })

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menampilkan Data Pembayaran Siswa",
      data: cari
    })

  } catch (error) {
    console.log(error)
    return res.status(403).send("Terjadi Kesalahan")
  }
}

async function updateResponse (req, res) {
  try {
    const {payload} = req.body;

    let berhasil = 0;
    let gagal = 0;

    if (!Array.isArray(payload)) {
      return res.status(400).json({
        status: "Error",
        msg: "Invalid payload format. Payload must be an array.",
      });
    }

    await Promise.all(
      payload.map(async (data) => {
        try {
          await pembayaranModel.update({
            status: data.status,
            tanggal_konfirmasi: new Date(),
            teacher_id: req.teacher_id
          },
          {
            where: {
              id: data.id
            }
          }
        )
        berhasil += 1;
        } catch (error) {
          console.log(error);
          gagal += 1;
        }
      })
    );

    
    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menguhah Status Approval",
      data: payload
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan")
  }
}

module.exports = {
  createKartuSpp,
  detailPembayaran,
  ListPembayaran,
  createPembayaran,
  updateResponse,
  createNotification,
  daftarSiswa,
  detailPembayaranSiswa
};

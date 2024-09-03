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
const { Op } = require("sequelize");
const axios = require("axios");
const { tanggal } = require("../../utils/tanggal");
const crypto = require("crypto");
const Midtrans = require("midtrans-client");
require("dotenv").config();

let snap = new midtrans.Snap({
  isProduction: process.env.MIDTRANS_PRDOUCITON,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const Monthmap = {
  Juli: 1,
  Agustus: 2,
  September: 3,
  Oktober: 4,
  November: 5,
  Desemeber: 6,
  Januari: 7,
  Februari: 8,
  Maret: 9,
  April: 10,
  Mei: 11,
  Juni: 12,
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
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
    ];

    let newRecords = [];

    // Process each item in the payload
    await Promise.all(
      payload.map(async (item) => {
        try {
          if (item.student_id === null && item.ta_id === null) {
            console.log("Barang ID_siswa Dan ID_TA Tidak Ada");
            gagal += 1;
            return;
          }

          const cari = await pembayaranModel.findOne({
            where: {
              student_id: item.student_id,
              ta_id: item.ta_id,
            },
          });

          if (cari) {
            console.log(
              `Data Yang Sudah Ada: id_siswa:${item.student_id} dan id_ta: ${item.ta_id}`
            );
            gagal += 1;
          } else {
            const recordsForMonths = months.map((month, index) => {
              const year = index < 6 ? 2024 : 2025;

              return {
                student_id: item.student_id,
                ta_id: item.ta_id,
                nominal: item.nominal,
                status: "Belum",
                bulan: month,
                tahun: year,
                teacher_id: req.id,
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
    const {
      page,
      pageSize,
      nama_siswa,
      dari_tahun,
      ke_tahun,
      dari_bulan,
      ke_bulan,
      tahun,
      bulan,
      nama_tahun_ajaran,
      status,
    } = req.query;

    let Result = {};

    const dariBulan = dari_bulan ? Monthmap[dari_bulan] : null;

    const keBulan = ke_bulan ? Monthmap[ke_bulan] : null;

    console.log("Dari Bulan :", dariBulan);
    console.log("Ke Bulan:", keBulan);

    if (dari_bulan && ke_bulan) {
      Result = {
        bulan: {
          [Op.or]: [
            { [Op.eq]: dari_bulan },
            { [Op.eq]: ke_bulan },
            {
              [Op.and]: [
                { [Op.gte]: dari_bulan },
                {
                  [Op.lte]: ke_bulan,
                },
              ],
            },
          ],
        },
      };
    } else if (dari_bulan) {
      Result = {
        bulan: {
          [Op.substring]: dari_bulan,
        },
      };
    } else if (ke_bulan) {
      Result = {
        bulan: {
          [Op.substring]: ke_bulan,
        },
      };
    }

    if (dari_tahun && ke_tahun) {
      Result = {
        tahun: {
          [Op.between]: [dari_tahun, ke_tahun],
        },
      };
    }

    if (bulan) {
      Result.bulan = {
        [Op.substring]: bulan,
      };
    }

    if (tahun) {
      Result.tahun = {
        [Op.substring]: tahun,
      };
    }
    if (status) {
      Result.status = {
        [Op.like]: status,
      };
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
            ...(checkQuery(nama_siswa) && {
              nama_siswa: { [Op.substring]: nama_siswa },
            }),
          },
        },
        {
          model: models.ta,
          require: true,
          as: "ta",
          attributes: ["id", "nama_tahun_ajaran"],
          where: {
            ...(checkQuery(nama_tahun_ajaran) && {
              nama_tahun_ajaran: {
                [Op.substring]: nama_tahun_ajaran,
              },
            }),
          },
        },
        {
          model: models.teacher,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru", "status"],
        },
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

// Midtrans Payment Gateway

async function createPembayaranOtomatis(req, res) {
  const { id } = req.params;

  const { nominal, walsan_id, bulan, tahun } = req.body;

  console.log("ID from req.params:", id);
  console.log("req.id:", req.id);
  console.log("req.walsan_id:", req.walsan_id);

  if (!id) {
    return res.status(400).json({ error: "ID parameter is required" });
  }

  try {
    const timestamp = new Date();

    const user = await userModel.findOne({
      where: {
        id: req.id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const dataUpdate = await PembayaranController.findOne({
      where: {
        id: id,
      },
    });

    if (!dataUpdate) {
      return res.status(404).json({ error: "Pembayaran not found" });
    }

    const walsan = await parentModel.findOne({
      where: {
        id: req.walsan_id,
      },
    });

    if (!walsan) {
      return res.status(404).json({ error: "Walsan not found" });
    }

    let transaksi_id = `SPP${user.id}${walsan.id}${timestamp}`;

    let parameter = {
      transaction_details: {
        order_id: transaksi_id,
        gross_amount: dataUpdate.nominal,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        email: user.email,
        first_name: walsan.nama_wali,
        last_name: "MQ",
        phone: `+62${walsan.no_hp}`,
        biling_address: {
          first_name: walsan.nama_wali,
          last_name: "MQ",
          email: user.email,
          phone: walsan.no_hp,
          address: "Desa Singasari",
          city: "Bogor",
          postal_code: "16830",
          country_code: "IDN",
        },
      },
      shipping_address: {
        first_name: walsan.nama_wali,
        last_name: "MQ",
        email: user.email,
        phone: walsan.no_hp,
        address: "Desa Singasari",
        city: "Bogor",
        postal_code: "16830",
        country_code: "IDN",
      },
      item_details: [
        {
          id: dataUpdate.id,
          price: dataUpdate.nominal,
          quantity: 1,
          name: `SPP Bulan ${dataUpdate.bulan}`,
        },
      ],
    };

    const transaksi = await snap.createTransaction(parameter);
    let tokenTransaksi = transaksi.token;
    const pembayaran = await PembayaranController.update(
      {
        walsan_id: req.walsan_id,
        no_telepon: walsan.no_hp,
        token_bayar: tokenTransaksi,
        transaksi_id: transaksi_id,
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Membayar SPP",
      data: dataUpdate,
    });
  } catch (error) {
    console.log("Error Log:", error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}

// const updateStatusDariMidtrans = async (transaction_id, data) => {
//   const hash = crypto.createHash('sha512').update(`${transaction_id}${data.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex')

//   if (data.signature_key !== hash) {
//     return res.json({
//       status: "Error",
//       msg: "Invalid Signature Key"
//     })
//   }

//   let responseData = null;
//   let transactionStatus = data.transaction_status;
//   let fraudStatus = data.fraud_status;
// }

async function createNotifPembayaran(req, res) {
  try {
    const data = req.body;

    console.log(data);

    const notif = snap.transaction.notification(data);
    let orderId = notif.order_id;
    let transactionStatus = notif.transaction_status;
    let fraudStatus = notif.fraud_status;

    const pembayaran = await pembayaranModel.findOne({
      where: {
        transaksi_id: orderId,
      },
    });

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    );

    let updateData = {};

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        updateData.status = "Sudah";
        
      }
    } else if (transactionStatus == "settlement") {
      updateData.status = "Sudah";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      updateData.status = "Belum";
    } else if (transactionStatus == "pending") {
      updateData.status = "Belum";
    }

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Mengirim Notif Pembayaran",
    });
  } catch (error) {
    console.error("Error processing notification:", error);
    return res.status(500).send("Internal Server Error");
  }
}

// Wablas

async function createNotification(req, res) {
  try {
    const walsan = await parentModel.findAll();

    console.log("WABLAS", process.env.WABLAS_TOKEN);

    const token = `${process.env.WABLAS_TOKEN}`;

    //       const data = {
    //       phone: `6281775490737`,
    //       message: "Test",
    //     };

    // await axios.post("https://jogja.wablas.com/api/send-message", data, {
    //           headers: {
    //             Authorization: token,
    //             "Content-Type": "application/json",
    //           },
    //         });

    await Promise.all(
      walsan.map(async (item) => {
        const data = {
          phone: `62${item.no_hp}`,
          message:
            "Assalamualaikum, Para Wali Santri, Dimohon Untuk Setiap Tanggal 5 Setiap Bulan Diingatkan Untuk Membayar SPP Anak Anda, Terimakasih Atas Perhatiannya. Jazzamukhairan Khasiran",
        };

        try {
          await axios.post("https://jogja.wablas.com/api/send-message", data, {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          if (error.response) {
            // Log detailed error information
            console.error(
              "Error sending notification:",
              error.response.status,
              error.response.data
            );
          } else if (error.request) {
            // Request was made but no response received
            console.error("No response received:", error.request);
          } else {
            // Something else caused the error
            console.error("Error setting up the request:", error.message);
          }
        }
      })
    );

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menambahkan Pesan",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(403).send("Terjadi Kesalahan");
  }
}

async function daftarSiswa(req, res) {
  const { page, pageSize, angkatan, tahun_ajaran, status, nama_siswa } =
    req.query;
  try {
    const cari = await studentModel.findAndCountAll({
      limit: pageSize,
      offset: page,
      where: {
        ...(checkQuery(angkatan) && {
          angkatan: { [Op.like]: angkatan },
        }),
        ...(checkQuery(nama_siswa) && {
          nama_siswa: {
            [Op.substring]: nama_siswa,
          },
        }),
        ...(checkQuery(status) && {
          status: {
            [Op.like]: status,
          },
        }),
        ...(checkQuery(tahun_ajaran) && {
          tahun_ajaran: {
            [Op.like]: tahun_ajaran,
          },
        }),
      },
    });

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menampilkan Siswa",
      data: cari,
      page,
      pageSize,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      status: "Failed",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function detailPembayaranSiswa(req, res) {
  try {
    const { student_id } = req.params;
    const { page, pageSize } = req.query;

    const cari = await PembayaranController.findAndCountAll({
      where: {
        student_id: student_id,
      },
      limit: pageSize,
      offset: page,
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
      order: ["id", ["bulan", "ASC"]],
    });

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Menampilkan Data Pembayaran Siswa",
      data: cari,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}

async function updateResponse(req, res) {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        const token = process.env.WABLAS_TOKEN;

        const pembayaran = await pembayaranModel.findOne({
          where: {
            status: data.status,
          },
          include: [
            {
              model: models.parent,
              require: true,
              as: "walsan",
              attributes: ["id", "nama_wali", "no_hp"],
            },
          ],
        });

        const hp = `62${pembayaran.walsan.no_hp}`;

        if (pembayaran && pembayaran.walsan.no_hp) {
          console.log("Phone number:", hp);
          // Now use `phone` in your pesanData
        }
        const pesanData = {
          phone: hp,
          message:
            "Assalamualaikum, Para Wali Santri, Terima Kasih Sudah Membayar SPP Sekolah Ke Pihak Guru. Jazzamukhairan Khasiran",
        };

        console.log(token);
        console.log(data);

        try {
          if (pembayaran && pembayaran.status === "Sudah") {
            try {
              const response = await axios.post(
                "https://jogja.wablas.com/api/send-message",
                pesanData,
                {
                  headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                  },
                }
              );

              // Check the response from the Wablas API
              if (response.data.status && response.data.status === "success") {
                console.log(`Message sent successfully to ${pesanData.phone}`);
              } else {
                console.error("Failed to send message:", response.data);
                gagal += 1;
                return;
              }
            } catch (error) {
              console.error("Error sending notification:", error);
              gagal += 1;
              return;
            }
          }

          await pembayaranModel.update(
            {
              status: data.status,
              tanggal_konfirmasi: new Date(),
              teacher_id: req.teacher_id,
            },
            {
              where: {
                id: data.id,
              },
            }
          );
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
      data: payload,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan");
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
  detailPembayaranSiswa,
  createPembayaranOtomatis,
  createNotifPembayaran,
};

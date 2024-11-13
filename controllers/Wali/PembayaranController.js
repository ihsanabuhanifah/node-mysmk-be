const PembayaranController = require("../../models").pembayaran_spp;
const models = require("../../models");
const pembayaranModel = require("../../models").pembayaran_spp;

const { checkQuery } = require("../../utils/format");
const userModel = require("../../models").user;
const studentModel = require("../../models").student;
const parentModel = require("../../models").parent;
const { Op, where } = require("sequelize");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const midtransClient = require("midtrans-client");

require("dotenv").config();

let snap = new midtransClient.Snap({
  // Set to true if you want Production Environment (accept real transaction).
  isProduction: false,
  serverKey: "SB-Mid-server-eNvmFDUCr_FrDMUNKw0-9-9m",
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
                tanggal_konfirmasi: null
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
      attributes: [
        "id",
        "walsan_id",
        "tanggal",
        "foto",
        "status",
        "bulan",
        "tahun",
        "nominal",
        "tanggal_konfirmasi",
        "teacher_id",
        "no_telepon",
        "keterangan",
        "transaction_id",
        "redirect_url",
        "transaction_token",
        "status_midtrans",
        "created_at",
        "updated_at",
        "order_id",
      ],
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
        tanggal: new Date()
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
      data: detail,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}

// Midtrans Payment Gateway

async function createPembayaranOtomatis(req, res) {
  const { id } = req.params;

  console.log("ID from req.params:", id);
  console.log("req.id:", req.id);
  console.log("req.walsan_id:", req.walsan_id);

  if (!id) {
    return res.status(400).json({ error: "ID parameter is required" });
  }

  try {

    const timestamp = Date.now();

    const user = await userModel.findOne({
      where: { id: req.id }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

        const dataUpdate = await pembayaranModel.findOne({
      where: {
        id: id,
      },
      attributes: [
        'id', 'walsan_id', 'tanggal', 'foto', 'status', 'bulan', 'tahun',
        'nominal', 'tanggal_konfirmasi', 'teacher_id', 'no_telepon',
        'keterangan', 'redirect_url', 'transaction_token',
        'status_midtrans', 'created_at', 'updated_at', 'order_id', 'transaction_id'
      ]
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


    const response = await axios.post('https://app.sandbox.midtrans.com/snap/v1/transactions', parameter, {
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64')}`
      }
    });

    console.log("Midtrans Response:", response.data);
    const token = response.data.token;
    const redirect_url = response.data.redirect_url;
    const transactionId = response.data.transaction_id;


      await PembayaranController.update(
      {
        walsan_id: req.walsan_id,
        no_telepon: walsan.no_hp,
        transaction_token: token,
        redirect_url: redirect_url,
        order_id: transaksi_id,
        transaction_id: transactionId
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
      transaction_id: transactionId
    });
  } catch (error) {
    console.log("Error Log:", error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}

// async function createPembayaranOtomatis(req, res) {

//   const { id } = req.params;

//   const { nominal, walsan_id, bulan, tahun, user_id } = req.body;

//   console.log("ID from req.params:", id);
//   console.log("req.id:", req.id);
//   console.log("req.walsan_id:", req.walsan_id);

//   if (!id) {
//     return res.status(400).json({ error: "ID parameter is required" });
//   }

//   try {
//     const timestamp = Date.now();

//     const user = await userModel.findOne({
//       where: {
//         id: req.id,
//       },
//     });

    // if (!user) {
    //   return res.status(404).json({ error: "User not found" });
    // }

//     const dataUpdate = await pembayaranModel.findOne({
//       where: {
//         id: id,
//       },
//       attributes: [
//         'id', 'walsan_id', 'tanggal', 'foto', 'status', 'bulan', 'tahun',
//         'nominal', 'tanggal_konfirmasi', 'teacher_id', 'no_telepon',
//         'keterangan', 'redirect_url', 'transaction_token',
//         'status_midtrans', 'created_at', 'updated_at', 'order_id', 'transaction_id'
//       ]
//     });

//     if (!dataUpdate) {
//       return res.status(404).json({ error: "Pembayaran not found" });
//     }

//     const walsan = await parentModel.findOne({
//       where: {
//         id: req.walsan_id,
//       },
//     });

//     if (!walsan) {
//       return res.status(404).json({ error: "Walsan not found" });
//     }

//     let transaksi_id = `SPP${user.id}${walsan.id}${timestamp}`;

//     let parameter = {
//       transaction_details: {
//         order_id: transaksi_id,
//         gross_amount: dataUpdate.nominal,
//       },
//       credit_card: {
//         secure: true,
//       },
//       customer_details: {
//         email: user.email,
//         first_name: walsan.nama_wali,
//         last_name: "MQ",
//         phone: `+62${walsan.no_hp}`,
//         biling_address: {
//           first_name: walsan.nama_wali,
//           last_name: "MQ",
//           email: user.email,
//           phone: walsan.no_hp,
//           address: "Desa Singasari",
//           city: "Bogor",
//           postal_code: "16830",
//           country_code: "IDN",
//         },
//       },
//       shipping_address: {
//         first_name: walsan.nama_wali,
//         last_name: "MQ",
//         email: user.email,
//         phone: walsan.no_hp,
//         address: "Desa Singasari",
//         city: "Bogor",
//         postal_code: "16830",
//         country_code: "IDN",
//       },
//       item_details: [
//         {
//           id: dataUpdate.id,
//           price: dataUpdate.nominal,
//           quantity: 1,
//           name: `SPP Bulan ${dataUpdate.bulan}`,
//         },
//       ],
//     };

//     // Log after transaction creation
//     console.log("Transaction created successfully, updating database...");

//     const transaksi = await snap.createTransaction(parameter);
//     console.log("Midtrans Response:", transaksi)
//     let tokenTransaksi = transaksi.token;
//     let redirect = transaksi.redirect_url;

//     console.log("Updating with transaction_id:");

//     console.log("Database updated successfully.");

//     await PembayaranController.update(
//       {
//         walsan_id: req.walsan_id,
//         no_telepon: walsan.no_hp,
//         transaction_token: tokenTransaksi,
//         redirect_url: redirect,
//         order_id: transaksi_id,
//         transaction_id: transaksi_id
//       },
//       {
//         where: {
//           id: id,
//         },
//       }
//     );

//     return res.status(201).json({
//       status: "Success",
//       msg: "Berhasil Membayar SPP",
//       data: dataUpdate,
//     });
//   } catch (error) {
//     console.log("Error Log:", error);
//     return res.status(403).send("Terjadi Kesalahan");
//   }
// }

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

// async function createNotifPembayaran(req, res) {
//   const data = req.body;

//   const { order_id, transaction_status, fraud_status } = data;

//   await snap.transaction.notification(data).then((responStatus) => {
//     let orderId = responStatus.order_id;
//     let transactionStatus = responStatus.transaction_status;
//     let fraudStatus = responStatus.fraud_status;

//     console.log(
//       `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
//     );

//     const pembayaran = pembayaranModel.findOne({
//       where: {
//         transaksi_id: order_id,
//       },
//     });

//     let updateData = {};

//     if (transactionStatus == "capture") {
//       if (fraudStatus == "accept") {
//         updateData.status = "Sudah";
//       }
//     } else if (transactionStatus == "settlement") {

//       updateData.status = "Sudah";
//     } else if (
//       transactionStatus == "cancel" ||
//       transactionStatus == "deny" ||
//       transactionStatus == "expire"
//     ) {
//       updateData.status = "Belum";
//     } else if (transactionStatus == "pending") {
//       updateData.status = "Belum";
//     }

//     pembayaran.update(updateData);
//   });

//   return res.status(201).json({
//     status: "Success",
//     msg: "Berhasil Mengirim Notif Pembayaran",
//   });
// }

const createNotifPembayaran = async (req, res) => {
  try {
    const { order_id, transaction_status, fraud_status } =
      req.body;

    console.log(
      `Transaction notification received. Order ID: ${order_id}. Transaction status: ${transaction_status}. Fraud status: ${fraud_status}`
    );

    // Log all transaction tokens for debugging
    const pembayaranEntries = await pembayaranModel.findAll({
      attributes: ["order_id"],
    });
    console.log(
      "All transaction_tokens in database:",
      pembayaranEntries.map((entry) => entry.transaction_token)
    );

    // Find the pembayaran entry in the database
    const pembayaran = await pembayaranModel.findOne({
      where: {
        order_id:order_id, // Ensure this matches the correct column
      }
    });

    if (!pembayaran) {
      console.error("Pembayaran not found for the given order_id:", order_id);
      return res.status(404).json({ error: "Pembayaran not found" });
    }

    console.log(`Found pembayaran for Order ID: ${order_id}`);

    // Check if the status has already been updated to avoid duplicate updates
    if (pembayaran.status === "Sudah" && transaction_status === "settlement") {
      return res.status(200).json({
        status: "Success",
        msg: "Pembayaran sudah diupdate sebelumnya",
      });
    }

    // Prepare the data for updating the pembayaran status
    let updateData = {
      status_midtrans: transaction_status,
    };

    // Update logic based on transaction status
    if (transaction_status === "capture" && fraud_status === "accept") {
      updateData.status = "Sudah";
    } else if (transaction_status === "settlement") {
      updateData.status = "Sudah";
    } else if (
      ["cancel", "deny", "expire", "pending"].includes(transaction_status)
    ) {
      updateData.status = "Belum";
    }

    // Update the pembayaran entry
    await pembayaran.update(updateData);

    // Return a successful response
    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Mengupdate Status Pembayaran",
    });
  } catch (error) {
    console.error("Error processing notification:", error);

    // Handle errors, specifically check for Midtrans 404 error
    if (error.httpStatusCode === 404) {
      return res
        .status(404)
        .json({ status: "Failed", message: "Error 404 Dari Midtrans" });
    }

    // Handle other errors and send a 500 response
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// const createNotifPembayaran = async (req, res) => {
//   try {
//     const { order_id, transaction_status, fraud_status } = req.body; // Keep all three fields

//     console.log(
//       `Transaction notification received. Order ID: ${order_id}. Transaction status: ${transaction_status}. Fraud status: ${fraud_status}`
//     );

//     // Find the pembayaran entry in the database using order_id
//     const pembayaran = await pembayaranModel.findOne({
//       where: { order_id: order_id },
//       attributes: [
//         'id', 'walsan_id', 'tanggal', 'foto', 'status', 'bulan', 'tahun',
//         'nominal', 'tanggal_konfirmasi', 'teacher_id', 'no_telepon',
//         'keterangan', 'redirect_url', 'transaction_token',
//         'status_midtrans', 'created_at', 'updated_at', 'order_id', 'transaction_id'
//       ] // Look for the entry by order_id
//     });

//     if (!pembayaran) {
//       console.error("Pembayaran not found for the given order_id:", order_id);
//       return res.status(404).json({ error: "Pembayaran not found" });
//     }

//     console.log(`Found pembayaran for Order ID: ${order_id}`);

//     // Check if the status has already been updated to avoid duplicate updates
//     if (pembayaran.status === "Sudah" && transaction_status === "settlement") {
//       return res.status(200).json({
//         status: "Success",
//         msg: "Pembayaran sudah diupdate sebelumnya",
//       });
//     }

//     // Prepare the data for updating the pembayaran status
//     let updateData = {};

//     // Update logic based on transaction status and fraud status
//     if (transaction_status === "capture" && fraud_status === "accept") {
//       updateData.status = "Sudah";
//     } else if (transaction_status === "settlement") {
//       updateData.status = "Sudah";
//     } else if (
//       ["cancel", "deny", "expire", "pending"].includes(transaction_status)
//     ) {
//       updateData.status = "Belum";
//     }

//     // Update the pembayaran entry
//     await pembayaran.update(updateData);

//     // Return a successful response
//     return res.status(201).json({
//       status: "Success",
//       msg: "Berhasil Mengupdate Status Pembayaran",
//     });
//   } catch (error) {
//     console.error("Error processing notification:", error);

//     // Handle errors and send a 500 response
//     return res.status(500).json({
//       status: "fail",
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// Wablas

async function createNotification(req, res) {
  const {bulan_pilihan, ta_id} = req.body

  try {
    const walsan = await parentModel.findAll();

    
  const pembayaran = await pembayaranModel.findAll({
    where: {
      bulan: bulan_pilihan,
      ta_id: ta_id
    },
    include: [
  {
    model: models.student,
    as: "murid",
    require: true,
    attributes: ["id", "nama_siswa"]
  },
  {
    model: models.ta,
    as: "ta",
    require:true,
    attributes: ["id", "nama_tahun_ajaran"]
  }
    ]
  })


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
      pembayaran.map( async (payment) => {
        const namaSiswa = payment.murid?.nama_siswa || "siswa";
        const tahunAjaran = payment.ta?.nama_tahun_ajaran;
        const namaBulan = payment.bulan;

        walsan.map(async (item) => {
          const data = {
            phone: `62${item.no_hp}`,
            message:
              `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu Wali Murid, Kami ingin menginformasikan bahwa pembayaran SPP untuk ${namaSiswa} pada bulan ${namaBulan} tahun ajaran ${tahunAjaran} belum kami terima. Kami harap Bapak/Ibu dapat segera menyelesaikan pembayaran agar proses pembelajaran putra/putri Bapak/Ibu dapat terus berjalan lancar. Silakan melakukan pembayaran melalui metode yang telah tersedia. Jika Bapak Atau Ibu memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi kami. Terima kasih atas perhatian dan kerjasamanya.`,
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
      }
        
      )
      
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

    let Result = {
      student_id: student_id
    };

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

    const cari = await PembayaranController.findAndCountAll({
      where: Result,
      limit: pageSize,
      offset: page,
      attributes: [
        "id",
        "walsan_id",
        "tanggal",
        "foto",
        "status",
        "bulan",
        "tahun",
        "nominal",
        "tanggal_konfirmasi",
        "teacher_id",
        "no_telepon",
        "keterangan",
        "transaction_id",
        "redirect_url",
        "transaction_token",
        "status_midtrans",
        "created_at",
        "updated_at",
        "order_id",
      ],
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

        try {
          const pembayaran = await pembayaranModel.findOne({
            where: {
              id: data.id,
            },
            include: [
              {
                model: models.parent,
                required: true,
                as: "walsan",
                attributes: ["id", "nama_wali", "no_hp"],
              },
            ],
          });

          if (!pembayaran || !pembayaran.walsan) {
            console.error("Payment or parent information not found for data:", data);
            gagal += 1;
            return;
          }

          // Check if the phone number is null
          if (!pembayaran.walsan.no_hp) {
            console.error(`Phone number is missing for parent ID ${pembayaran.walsan.id}`);
            gagal += 1;
            return;  // Prevent sending the message
          }

          const hp = `62${pembayaran.walsan.no_hp.substring(1, 12)}`;
          const pesanData = {
            phone: hp,
            message:
              "Assalamualaikum, Para Wali Santri, Terima Kasih Sudah Membayar SPP Sekolah Ke Pihak Guru. Jazzamukhairan Khasiran",
          };

          if (pembayaran.status === "Sudah") {
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

              console.log(`Pesan Sudah Dikirim Ke Nomor ${pesanData.phone}`, token, pesanData, response.data);
            } catch (error) {
              console.error("Error sending notification:", error);
              gagal += 1;
              return;
            }
          } else if (pembayaran.status === "Belum") {
            console.log("Status not 'Sudah', skipping message sending.");
          }

          try {
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
            console.log(`Successfully updated status for payment ID ${data.id} to ${data.status}`);
            berhasil += 1;
          } catch (error) {
            console.error(`Error updating status for payment ID ${data.id}:`, error);
            gagal += 1;
          }
        } catch (error) {
          console.error("Error processing data entry:", data, error);
          gagal += 1;
        }
      })
    );

    return res.status(201).json({
      status: "Success",
      msg: "Berhasil Mengubah Status Approval",
      data: { berhasil, gagal },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(403).send("Terjadi Kesalahan");
  }
}



async function createpdfBulanan(req, res) {
  const { bulan, tahun } = req.query;
  const { student_id } = req.params;
  try {
    const laporan = await pembayaranModel.findAll({
      where: {
        student_id: student_id,
      },
      
      attributes: [
        "id",
        "walsan_id",
        "tanggal",
        "foto",
        "status",
        "bulan",
        "tahun",
        "nominal",
        "tanggal_konfirmasi",
        "teacher_id",
        "no_telepon",
        "keterangan",
        "transaction_id",
        "redirect_url",
        "transaction_token",
        "status_midtrans",
        "created_at",
        "updated_at",
        "order_id",
      ],
      include: [
        {
          require: true,
          as: "murid",
          model: models.student,
          attributes: ["id", "nama_siswa"],
        },
      ],
      order: ["id", ["bulan", "ASC"]],
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Laporan_Pembayaran_${bulan}_${tahun}`
    );

    doc.pipe(res);

    // Kop Surat
    doc
      .image("assets/kop_surat.png", {
        fit: [500, 150],
        align: "center",
        valign: "top",
      })
      .moveDown(12);

    // Judul And Periode
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`Data Pembayaran SPP ${laporan[0].murid.nama_siswa} `)
      .moveDown(5);

    // Table headers
    const tableTop = 250;
    const colWidths = [50, 200, 200, 100];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = 50;
    const rowHeight = 30;

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("No.", startX, tableTop, {
        align: "center",
        width: colWidths[0],
      })
      .text("Bulan", startX + colWidths[0] + colWidths[1], tableTop, {
        width: colWidths[1],
        align: "center",
      })
      .text("Tahun", startX + colWidths[1], tableTop, {
        width: colWidths[2],
        align: "center",
      })
      .text(
        "Status",
        startX + colWidths[0] + colWidths[1] + colWidths[2],
        tableTop,
        {
          width: colWidths[3],
          align: "center",
        }
      );

    doc
      .moveTo(startX, tableTop + rowHeight)
      .lineTo(startX + tableWidth, tableTop + rowHeight)
      .stroke();

    const drawTableBorders = (
      startX,
      startY,
      colWidths,
      rowCount,
      rowHeight
    ) => {
      doc
        .lineJoin("miter")
        .rect(startX, startY, tableWidth, rowHeight * rowCount)
        .stroke();

      colWidths.reduce((x, width) => {
        doc
          .moveTo(x, startY)
          .lineTo(x, startY + rowHeight * rowCount)
          .stroke();

        return x + width;
      }, startX);
      for (let i = 1; i <= rowCount; i++) {
        doc.moveTo(startX, startY + rowHeight * i).stroke();
      }
    };

    let position = tableTop + rowHeight;

    laporan.forEach((laporan, index) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .text(`${index + 1}`, startX, position + rowHeight / 4, {
          width: colWidths[0],
          align: "center",
        })
        .text(laporan.bulan, startX + colWidths[0], position + rowHeight / 4, {
          width: colWidths[1],
          align: "center",
        })
        .text(
          laporan.tahun,
          startX + colWidths[0] + colWidths[1],
          position + rowHeight / 4,
          {
            width: colWidths[2],
            align: "center",
          }
        )
        .text(
          laporan.status,
          startX + colWidths[0] + colWidths[1] + colWidths[2],
          position + rowHeight / 4,
          {
            width: colWidths[3],
            align: "center",
          }
        );

      position += rowHeight;
    });

    drawTableBorders(
      startX,
      tableTop + rowHeight,
      colWidths,
      laporan.length,
      rowHeight
    );

    doc.end();
  } catch (error) {
    console.error("Terjadi Kesalahan:", error);
    res.status(500).json({ msg: "Terjadi Kesalahan Di Dalam Server" });
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
  createpdfBulanan,
};

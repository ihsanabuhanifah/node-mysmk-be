const KunjunganModel = require("../../models").penjengukan;
const { Op } = require("sequelize");
const models = require("../../models");
const { default: axios } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { checkQuery } = require("../../utils/format");

async function listKunjungan(req, res) {
  const { page, pageSize, nama_siswa, status_approval } = req.query;

  try {
    const list = await KunjunganModel.findAndCountAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      where: {
        ...(checkQuery(status_approval) && { status_approval }),
      },
      include: [
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            ...(checkQuery(nama_siswa) && {
              nama_siswa: {
                [Op.substring]: nama_siswa,
              },
            }),
          },
        },
        {
          model: models.teacher,
          require: true,
          as: "kunjungan_approv_by",
          attributes: ["id", "nama_guru"],
        },
      ],
      order: [["id", "desc"]],
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
      msg: "Berhasil mengambil semua perizinan",
      page: req.page,
      pageSize: pageSize,
      data: list,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

async function responseKunjungan(req, res) {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          await KunjunganModel.update(
            {
              status_approval: data.status_approval,
              alasan_ditolak: data.alasan_ditolak,
              approval_by: req.teacher_id,
            },
            {
              where: {
                id: data.id,
              },
            }
          );
          berhasil = berhasil + 1;
        } catch {
          gagal = gagal + 1;
        }
      })
    );

    // const urlAPI = process.env.URL_WA;
    // const token = process.env.WA_TOKEN;
    // const pesan = `⚠ *SMK MQ NOTIF* ⚠
    
    // Bismillah, Tiket kunjungan untuk tanggal 31-02-2025 sudah di proses oleh pihak kesantrian dengan hasil *DISETUJUI*
    
    // Jika ada pertanyaan seputar Tiket Kunjungan silahkan hubungi pihak CS atau Kesantrian SMK MQ
    // 0895320050324 (CS aplikasi : Ustadz Ihsan)
    // 085216143544 (Kesantrian : Ustadz Hamzah)`;

    // const data = {
    //   "phone": , //nomor wali santri
    //   "message": pesan,
    //   "isGroup": true
    // };

    // const response = await axios.post(urlAPI, data, {
    //   headers: {
    //     'Authorization': token,
    //     'Content-Type': 'application/json'
    //   }
    // });

    return res.json({
      status: "Success",
      berhasil,
      gagal,
      msg: `${berhasil} data diperharui dan ${gagal} gagal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

module.exports = { listKunjungan, responseKunjungan };

const IzinModel = require("../../models").izin_pulang;
const ParentModel = require("../../models").parent;
const { Op } = require("sequelize");
const models = require("../../models");
const { default: axios } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { checkQuery } = require("../../utils/format");

async function listPulang(req, res) {
  const { page, pageSize, nama_siswa, status_approval, keyword } = req.query;

  try {
    const list = await IzinModel.findAndCountAll({
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
          as: "pulang_approv_by",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.teacher,
          require: true,
          as: "laporan_oleh",
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

async function responsePulang(req, res) {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;
    const urlAPI = process.env.URL_WA;
    const token = process.env.TOKEN_WA;

    await Promise.all(
      payload.map(async (data) => {
        try {
          await IzinModel.update(
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
          let dtPulang = await IzinModel.findByPk(data.id);
          const tglPulang = dtPulang.tanggal;
          let dtWali = await ParentModel.findOne({
            where: {
              user_id: dtPulang.user_id,
            },
          });
          const hp = dtWali.no_hp;

          const pesan = `*SMK MQ NOTIF TIKET KUNJUNGAN*

Bismillah, Tiket kunjungan untuk tanggal ${tglPulang} sudah di proses oleh pihak kesantrian dengan hasil *${data.status_approval}* dengan alasan *${data.alasan_ditolak}*

Jika ada pertanyaan seputar Tiket Kunjungan silahkan hubungi pihak CS atau Kesantrian SMK MQ
0895320050324 (CS aplikasi : Ustadz Ihsan)
085216143544 (Kesantrian : Ustadz Hamzah)`;

          const dtx = {
            "phone": hp, //nomor wali santri
            "message": pesan
          };

          const response = await axios.post(urlAPI, dtx, {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          });

          berhasil = berhasil + 1;
        } catch {
          gagal = gagal + 1;
        }
      })
    );

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

async function laporanPulang(req, res) {


  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          await IzinModel.update(
            {
              tanggal_kembali: data.tanggal_kembali,
              jam_kembali_ke_sekolah: data.jam_kembali_ke_sekolah,
              status_kepulangan: data.status_kepulangan,
              jumlah_hari_terlambat: data.jumlah_hari_terlambat,
              denda: data.denda,
              dilaporkan_oleh: req.teacher_id,
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

module.exports = { listPulang, responsePulang, laporanPulang };

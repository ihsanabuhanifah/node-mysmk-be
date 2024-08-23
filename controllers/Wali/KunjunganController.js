const KunjunganModel = require("../../models").penjengukan;
const IzinModel = require("../../models").izn_pulang;
const { default: axios } = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { Op } = require("sequelize");
const models = require("../../models");
async function buatIzin(req, res) {
  try {
    const payload = req.body;
    (payload.user_id = req.id), (payload.student_id = req.StudentId);
    payload.status_approval = "menunggu";
    await KunjunganModel.create(payload);

    const urlAPI = process.env.URL_WA;
    const token = process.env.WA_TOKEN;
    const pesan = `⚠ *SMK MQ NOTIF* ⚠
    
    Bismillah, ada wali santri yang mengisi data Tiket Kunjungan berikut data detailnya:
    Nama santri : Fullan
    Kelas : XII RPL
    Jenis : Kunjungan
    Tanggal Kunjungan : 31-02-2025
    Kepentinggan : Mengantar Obat
    
    Untuk data lebih lengkapnya & menyetujuinya silahkan buka website https://mysmk.smkmadinatulquran.sch.id/`;

    const data = {
      "phone": 120363225259421052,
      "message": pesan,
      "isGroup": true
    };

    const response = await axios.post(urlAPI, data, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    return res.json({
      status: "Success",
      msg: "Pengajuan Kunjugan Berhasil dibuat",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

async function listIzin(req, res) {
  const { page, pageSize } = req.query;

  try {
    const list = await KunjunganModel.findAll({
      where: {
        user_id: req.id,
      },
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      include: [
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
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
        msg: "Belum pernah membuat perizinan",
        data: list,
      });
    }

    return res.json({
      status: "Success",
      msg: "Berhasil mengambil data",
      data: list,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

async function detailIzin(req, res) {
  try {
    const { id } = req.params;
    const detail = await KunjunganModel.findOne({
      where: {
        id: id,
        user_id: req.id,
      },
      include: [
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
        },
        {
          model: models.teacher,
          require: true,
          as: "kunjungan_approv_by",
          attributes: ["id", "nama_guru"],
        },
      ],
    });
    if (!detail) {
      return res.json({
        status: "Success",
        msg: "Perizinan tidak ditemukan",
        data: detail,
      });
    }
    return res.json({
      status: "Success",
      msg: "Perzinan ditemukan",
      data: detail,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

async function updateIzin(req, res) {
  try {
    const { id } = req.params;
    const { tanggal, kepentingan } = req.body;
    const detail = await KunjunganModel.findOne({
      where: {
        id: id,
        user_id: req.id,
      },
    });
    if (!detail) {
      return res.json({
        status: "Success",
        msg: "Perizinan tidak ditemukan",
        data: detail,
      });
    }

    if (detail.status_approval !== "menunggu") {
      return res.status(422).json({
        status: "Fail",
        msg: "Tidak dapat merubah , Perizinan sudah di proses",
      });
    }

    await KunjunganModel.update(
      {
        tanggal,
        kepentingan,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return res.json({
      status: "Success",
      msg: "Perzinan berhasil di update",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

module.exports = { buatIzin, listIzin, detailIzin, updateIzin };

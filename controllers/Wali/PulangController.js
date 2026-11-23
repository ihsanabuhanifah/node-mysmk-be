const IzinModel = require("../../models").izin_pulang;
const { Op } = require("sequelize");
const models = require("../../models");
const { kirimWaGrup, isTanggal } = require("../../utils/waNotif");
const dotenv = require("dotenv");
dotenv.config();
async function buatIzinPulang(req, res) {
  try {
    const { izin_dari, izin_sampai } = req.body || {};
    const kepentingan = String(req.body?.kepentingan ?? "").trim();
    if (!isTanggal(izin_dari) || !isTanggal(izin_sampai) || !kepentingan) {
      return res.status(422).json({ status: "Fail", msg: "Tanggal jemput, tanggal antar, dan kepentingan wajib diisi" });
    }
    if (izin_sampai < izin_dari) {
      return res.status(422).json({ status: "Fail", msg: "Tanggal antar tidak boleh sebelum tanggal jemput" });
    }
    // hanya field milik wali; status & approval ditentukan server
    await IzinModel.create({
      izin_dari,
      izin_sampai,
      kepentingan: kepentingan.slice(0, 255),
      user_id: req.id,
      student_id: req.StudentId,
      status_approval: "menunggu",
    });

    kirimWaGrup(`*SMK MQ NOTIF IZIN KEPULANGAN*

Bismillah, ada wali santri yang mengisi data Tiket Izin Kepulangan berikut data detailnya:
Nama santri : ${req.nama_siswa}
Tanggal Jemput : ${izin_dari}
Tanggal Antar : ${izin_sampai}
Kepentinggan : ${kepentingan}

Untuk mengkonfirmasi silahkan buka website https://mysmk.smkmadinatulquran.sch.id/guru/perizinan-pulang`);

    return res.json({
      status: "Success",
      msg: "Pengajuan Pulang Berhasil dibuat",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

async function listIzinPulang(req, res) {
  const { page, pageSize } = req.query;

  try {
    const list = await IzinModel.findAll({
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
          as: "pulang_approv_by",
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

async function detailIzinPulang(req, res) {
  try {
    const { id } = req.params;
    const detail = await IzinModel.findOne({
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
          as: "pulang_approv_by",
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

async function updateIzinPulang(req, res) {
  try {
    const { id } = req.params;
    const { izin_dari, izin_sampai, kepentingan } = req.body || {};
    if ((izin_dari !== undefined && !isTanggal(izin_dari)) || (izin_sampai !== undefined && !isTanggal(izin_sampai))) {
      return res.status(422).json({ status: "Fail", msg: "Format tanggal tidak valid" });
    }
    const detail = await IzinModel.findOne({
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

    const dari = izin_dari ?? detail.izin_dari;
    const sampai = izin_sampai ?? detail.izin_sampai;
    if (String(sampai).slice(0, 10) < String(dari).slice(0, 10)) {
      return res.status(422).json({ status: "Fail", msg: "Tanggal antar tidak boleh sebelum tanggal jemput" });
    }
    await IzinModel.update(
      {
        izin_dari: dari,
        izin_sampai: sampai,
        ...(kepentingan !== undefined && { kepentingan: String(kepentingan).trim().slice(0, 255) }),
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

async function terakhirIzinPulang(req, res) {
  const { page, pageSize } = req.query;

  try {
    const list = await IzinModel.findAll({
      where: {
        user_id: req.id,
      },
      limit: 1,
      offset: 1,

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

module.exports = {
  buatIzinPulang,
  listIzinPulang,
  detailIzinPulang,
  updateIzinPulang,
  terakhirIzinPulang
};

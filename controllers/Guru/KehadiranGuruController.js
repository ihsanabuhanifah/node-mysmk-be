const KehadiranGuruModel = require("../../models").kehadiran_guru;
const TeacherModel = require("../../models").teacher;
const models = require("../../models");
const { Op, where } = require("sequelize");
const moment = require("moment-timezone");
const { formatHari } = require("../../utils/format");
const { checkQuery } = require("../../utils/format");

async function submitIzin(req, res) {
  const { status, keterangan } = req.body;
  let jam = moment().tz("Asia/Jakarta").format("HH:mm:ss");
  try {
    const { tanggal } = req.body;
    const cek = await KehadiranGuruModel.findOne({
      where: {
        tanggal: tanggal,
        teacher_id: req.teacher_id,
      },
    });

    await KehadiranGuruModel.update(
      { status, keterangan },
      {
        where: {
          id: cek.id,
        },
      }
    );

    return res.json({
      status: "Success",
      msg: "Konfirmasi ketidakhadiran berhasil disimpan",
      data: cek,  
      jam,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function submitDatang(req, res) {
  let jam = moment().tz("Asia/Jakarta").format("HH:mm:ss");
  try {
    const { tanggal } = req.body;
    const cek = await KehadiranGuruModel.findOne({
      where: {
        tanggal: tanggal,
        teacher_id: req.teacher_id,
      },
    });

    await KehadiranGuruModel.update(
      { jam_datang: jam, status: "hadir" },
      {
        where: {
          id: cek.id,
        },
      }
    );

    return res.json({
      status: "Success",
      msg: "Jam Kedatangan Berhasil disimpan",
      data: cek,
      jam,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function submitPulang(req, res) {
  let jam = moment().tz("Asia/Jakarta").format("HH:mm:ss");
  try {
    const { tanggal } = req.body;
    const cek = await KehadiranGuruModel.findOne({
      where: {
        tanggal: tanggal,
        teacher_id: req.teacher_id,
        status: "hadir",
      },
    });

    if (!cek) {
      return res.json({
        status: "Success",
        msg: "Mohon maaf anda belum absensi kedatangan",
      });
    }

    await KehadiranGuruModel.update(
      { jam_pulang: jam },
      {
        where: {
          id: cek.id,
        },
      }
    );

    return res.json({
      status: "Success",
      msg: "Jam Kepulangan Berhasil disimpan",
      data: cek,
      jam,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function listKehadiran(req, res) {
  try {
    const { tanggal, nama_guru } = req.query;

    const data = await KehadiranGuruModel.findAll({
      where: {
        tanggal: tanggal,
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru", "user_id"],
          where: {
            ...(checkQuery(nama_guru) && {
              nama_guru: {
                [Op.substring]: nama_guru,
              },
            }),
          },
        },
      ],
    });

    return res.json({
      status: "Success",
      msg: "List Kehadiran Success",
      data: data,
    });
  } catch (err) {
    console.log("err", err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function createKehadiran(req, res) {
  let hari = formatHari(moment().tz("Asia/Jakarta").format("YYYY-MM-DD"));
  let tanggal_server = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
  let guru = await TeacherModel.findAll({
    where: {
      status: "active",
    },
  });
  try {
    const cek = await KehadiranGuruModel.findAll({
      where: {
        tanggal: tanggal_server,
      },
    });

    console.log("ce", cek);

    if (cek.length === 0) {
      await Promise.all(
        guru.map(async (item) => {
          const payload = {
            tanggal: tanggal_server,

            teacher_id: item.id,
          };

          console.log("pau", payload);
          await KehadiranGuruModel.create(payload);
        })
      );

      return res.json({
        status: "Success",
        msg: "List Kehadiran Success dibuat",
      });
    } else {
      return res.json({
        status: "Success",
        msg: "List Kehadiran sudah dibuat",
      });
    }
  } catch (err) {
    console.log("err", err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { listKehadiran, createKehadiran, submitDatang, submitPulang, submitIzin };

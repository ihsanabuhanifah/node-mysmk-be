const IzinModel = require("../../models").izin_pulang;
const { Op } = require("sequelize");
const models = require("../../models");
async function buatIzinPulang(req, res) {
  try {
    const payload = req.body;
    (payload.user_id = req.id), (payload.student_id = req.StudentId);
    payload.status_approval = "menunggu";
    await IzinModel.create(payload);
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
    const { tanggal, kepentingan } = req.body;
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

    await IzinModel.update(
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

module.exports = {
  buatIzinPulang,
  listIzinPulang,
  detailIzinPulang,
  updateIzinPulang,
};

const KunjunganModel = require("../../models").penjengukan;
const { Op } = require("sequelize");
const models = require("../../models");

async function listKunjungan(req, res) {
  const { page, pageSize, nama_siswa, status_approval } = req.query;

  try {
    const list = await KunjunganModel.findAll({
      ...(pageSize !== undefined && { limit: pageSize }),
      ...(page !== undefined && { offset: page }),
      where: {
        status_approval: status_approval,
      },
      include: [
        {
          model: models.student,
          require: true,
          as: "siswa",
          attributes: ["id", "nama_siswa"],
          where: {
            ...(nama_siswa !== undefined && { nama_siswa: nama_siswa }),
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
      data: list,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).send("Ada Kesalahan");
  }
}

async function responseKunjungan(req, res) {
  try {
    const { id } = req.params;
    const { status_approval, alasan_ditolak } = req.body;

    const Kunjugan = await KunjunganModel.findOne({
      where: {
        id: id,
      },
    });

    if (!Kunjugan) {
      return res.json({
        status: "Success",
        msg: "Kunjungan tidak ditemukan",
      });
    }

    await KunjunganModel.update(
      {
        status_approval,
        alasan_ditolak,
        approval_by: req.teacher_id,
      },
      {
        where: {
            id
        }
      }
    );

    return res.json({
      status: "Success",
      msg: "Update Berhasil",
      
    });
  } catch (err) {
      console.log(err)
    return res.status(403).send("Ada Kesalahan");
  }
}

module.exports = { listKunjungan, responseKunjungan };

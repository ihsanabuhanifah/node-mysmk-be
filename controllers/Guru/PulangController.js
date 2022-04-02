const IzinModel = require("../../models").izin_pulang;
const { Op } = require("sequelize");
const models = require("../../models");
const { checkQuery } = require("../../utils/format");

async function listPulang(req, res) {
  const { page, pageSize, nama_siswa, status_approval, keyword } = req.query;

  try {
    const list = await IzinModel.findAll({
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

async function responsePulang(req, res) {
  try {
    const { payload } = req.body;

    let berhasil = 0;
    let gagal = 0;

    await Promise.all(
      payload.map(async (data) => {
        try {
          await IzinModel.update(
            {
              status_approval: data.status_approval,
              alasan_ditolak: data.alasan_ditolak,
              approval_by : req.teacher_id
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

module.exports = { listPulang, responsePulang };

const parentModel = require("../../models").parent;
const models = require("../../models");
const profile = async (req, res) => {
  try {
    const parent = await parentModel.findOne({
      attributes: ["user_id", "hubungan"],
      where: {
        user_id: req.id,
      },
      include: [
        {
          model: models.student,
          require: true,
          as: "siswa",
          include: [
            {
              model: models.kelas_student,
              require: true,
              as: "kelas_student",
              attributes: ["id", "kelas_id"],
              include: [
                {
                  model: models.kelas,
                  require: true,
                  as: "kelas",
                  attributes: ["id", "nama_kelas"],
                },
              ],
              where: {
                status: 1,
              },
            },
          ],
        },
      ],
    });

    return res.json({
      parent,
    });
  } catch (err) {
    console.log(err);
    res.status(403).json({
      msg: "Terjadi Kesalahan",
    });
  }
  res.json({
    status: "ok",
  });
};

const create = async (req, res) => {
  try {
  } catch (err) {
    return res.status(403).json({
      status: "fail",
      msg: "Ada Kesalaan",
    });
  }
};

module.exports = { profile, create };

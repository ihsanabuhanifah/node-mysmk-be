const BankSoalController = require("../../models").bank_soal;

const models = require("../../models");
const { checkQuery } = require("../../utils/format");
const createSoal = async (req, res) => {
  try {
    const { payload } = req.body;
    let success = 0;
    let gagal = 0;
    let total = payload.length;
    await Promise.all(
      payload?.map(async (item) => {
        try {
          item.soal = JSON.stringify(item.soal);
          item.teacher_id = req.teacher_id
          await BankSoalController.create(item);
          success = success + 1;
        } catch {
          gagal = gagal + 1;
        }
      })
    );
    return res.status(201).json({
      status: "Success",
      msg: `Berhasil upload ${success} soal dari ${total} soal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const listSoal = async (req, res) => {
  let = { mapel_id, is_all, keyword, page, pageSize, isExam } = req.query;


  if(isExam && !!mapel_id === false ){
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: {
        
          rows : []
        
      },
    });
  }

  try {
    const soals = await BankSoalController.findAndCountAll({
      attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
      where: {
        ...(checkQuery(mapel_id) && {
          mapel_id: mapel_id,
        }),

        ...(parseInt(is_all) === 1 && {
          teacher_id: req.teacher_id,
        }),
      },
      include: [
        {
          model: models.teacher,
          require: true,
          as: "teacher",
          attributes: ["id", "nama_guru"],
        },
        {
          model: models.mapel,
          require: true,
          as: "mapel",
          attributes: ["id", "nama_mapel"],
        },
      ],
      limit: pageSize,
      offset: page,
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: soals,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const detailSoal = async (req, res) => {
  try {
    const { id } = req.params;

    const soal = await BankSoalController.findOne({
      where: {
        id: id,
      },
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      soal,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const updateSoal = async (req, res) => {
  try {
    const { id } = req.params;

    const payload = req.body;

    const soal = await BankSoalController.findOne({
      where: {
        id: id,
      },
    });

    if (soal === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "Soal Tidak Ditemukan",
      });
    }
    if (soal.teacher_id !== req.teacher_id) {
      return res.status(422).json({
        status: "Fail",
        msg: "Soal ini milik guru lain",
      });
    }

    payload.soal = JSON.stringify(payload.soal)

    

    await BankSoalController.update(payload, {
      where: {
        id,
      },
    });
    return res.json({
      status: "Success",
      msg: "Update Success",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const deleteSoal = async (req, res) => {
  const { payload } = req.body;

  console.log('pay', payload)
  try {
    let success = 0;
    let gagal = 0;
    let total = payload.length;
    await Promise.all(
      payload?.map(async (item) => {
        try {
          await BankSoalController.destroy({
            where: {
              id: item,
            },
          });
          success = success + 1;
        } catch {
          gagal = gagal + 1;
        }
      })
    );
    return res.status(200).json({
      status: "Success",
      msg: `Berhasil delete ${success} soal dari ${total} soal`,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

module.exports = { createSoal, listSoal, detailSoal, updateSoal, deleteSoal };

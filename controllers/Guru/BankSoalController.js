const BankSoalController = require("../../models").bank_soal;

const { Op } = require("sequelize");
const models = require("../../models");
const { bolehKelola } = require("../../utils/aksesUjian");
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
          item.teacher_id = req.teacher_id;
          await BankSoalController.create({
            ...item,
            jawaban: item.jawaban.toString(),

          });
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
  let = {
    mapel_id,
    is_all,
    keyword,
    page,
    pageSize,
    isExam,
    materi,
    nama_mapel,
  } = req.query;

  if (isExam && !!mapel_id === false) {
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: {
        rows: [],
      },
    });
  }

  const mapel_ids = [];

  if (!!nama_mapel === true) {
    const mapel_idsx = await models.mapel.findAll({
      attributes: ["id"],
      where: {
        ...(checkQuery(nama_mapel) && {
          nama_mapel: {
            [Op.like]: `%${nama_mapel}%`,
          },
        }),
      },
    });

    mapel_idsx.map((item) => {
      mapel_ids.push(item.id);
    });
  }

  console.log("mapel_ids", mapel_ids);

  try {
    const soals = await BankSoalController.findAndCountAll({
      attributes: ["id", "materi", "soal", "tipe", "jawaban", "point"],
      where: {
        ...(checkQuery(mapel_id) && {

          
          mapel_id: {
            [Op.in] : mapel_ids.length > 0 ? mapel_ids : [mapel_id],
          },
        }),

        ...(checkQuery(nama_mapel) && {
          materi: {
            [Op.like]: `%${materi}%`,
          },
        }),

        ...(checkQuery(materi) && {
          materi: {
            [Op.like]: `%${materi}%`,
          },
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
      order: [["id", "desc"]],
    });
    return res.json({
      status: "Success",
      msg: "Berhasil ditemukan",
      page: req.page,
      pageSize: pageSize,
      data: soals,
      mapel_ids: mapel_ids,
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
    // soal berisi kunci jawaban: hanya pemilik / pengelola
    if (!soal || !bolehKelola(req, soal.teacher_id)) {
      return res.status(403).json({
        status: "Fail",
        msg: "Soal tidak ditemukan atau milik guru lain",
      });
    }
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
    if (!bolehKelola(req, soal.teacher_id)) {
      return res.status(422).json({
        status: "Fail",
        msg: "Soal ini milik guru lain",
      });
    }

    // id & pemilik tidak boleh diubah lewat payload
    const { id: _id, teacher_id: _t, ...data } = payload;
    data.soal = JSON.stringify(payload.soal);

    await BankSoalController.update({
      ...data,
      jawaban: String(payload.jawaban ?? ""),
    }, {
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

// Hapus soal: hanya milik sendiri (atau pengelola) dan belum dipakai di ujian mana pun
const deleteSoal = async (req, res) => {
  const ids = [...new Set((req.body?.payload || []).map(Number).filter(Boolean))];
  try {
    const soal = await BankSoalController.findAll({
      where: { id: ids },
      attributes: ["id", "teacher_id"],
    });
    let success = 0;
    const gagal = [];

    for (const id of ids) {
      const item = soal.find((x) => Number(x.id) === id);
      if (!item) {
        gagal.push({ id, alasan: "Soal tidak ditemukan" });
        continue;
      }
      if (!bolehKelola(req, item.teacher_id)) {
        gagal.push({ id, alasan: "Soal milik guru lain" });
        continue;
      }
      const [{ n }] = await models.sequelize.query(
        "SELECT COUNT(*) AS n FROM ujians WHERE JSON_VALID(soal) AND JSON_CONTAINS(soal, :id)",
        { replacements: { id: String(id) }, type: models.Sequelize.QueryTypes.SELECT }
      );
      if (Number(n) > 0) {
        gagal.push({ id, alasan: `Dipakai di ${n} ujian` });
        continue;
      }
      await BankSoalController.destroy({ where: { id } });
      success += 1;
    }

    if (success === 0 && gagal.length) {
      return res.status(422).json({
        status: "Fail",
        msg: `Tidak ada soal yang dihapus: ${gagal[0].alasan}`,
        gagal,
      });
    }
    return res.status(200).json({
      status: "Success",
      msg:
        `Berhasil delete ${success} soal dari ${ids.length} soal` +
        (gagal.length ? `. ${gagal.length} tidak dihapus (milik guru lain / dipakai di ujian).` : ""),
      gagal,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

module.exports = { createSoal, listSoal, detailSoal, updateSoal, deleteSoal };

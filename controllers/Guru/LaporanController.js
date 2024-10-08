const GuruPiketModel = require("../../models").guru_piket;
const LaporanGuruPiketModel = require("../../models").laporan_guru_piket;
const models = require("../../models");

async function listPiketHariIni(req, res) {
  try {
    const { hari } = req.query;
    const jadwal = await GuruPiketModel.findAndCountAll({
      attributes: ["id", "hari", "status", "ta_id"],
      include: [
        {
          model: models.teacher,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },

        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      where: {
        status: 1,
        ...(hari !== undefined && { hari: hari }),
      },
    });
    return res.json({
      status: "Success",
      msg: "Jadwal ditemukan",
      data: jadwal,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

const listGuruPiketBelumLaporan = async (req, res) => {
  try {
    let { status, page, pageSize } = req.query;

    const notifikasi = await LaporanGuruPiketModel.findAndCountAll({
      attributes: ["id", "tanggal", "laporan", "status"],

      include: [
        {
          model: models.teacher,
          require: true,
          as: "guru",
          attributes: ["id", "nama_guru"],
        },

        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      where: {
        status: status,
      },
      group: ["tanggal", "teacher_id"],
      order: [["tanggal", "desc"]],
      limit: pageSize,
      offset: page,
    });

    return res.json({
      status: "Success",
      msg: "list guru laporan",
      data: notifikasi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const getDetailLaporanGuruPiket = async (req, res) => {
  try {
    let { id, tanggal } = req.params;
    const laporan = await LaporanGuruPiketModel.findOne({
      where: {
        id: id,
        // tanggal: tanggal,
      },
    });

    if(laporan === null){
      return res.json({
        status: "Success",
        msg: "Laporan tidak ditemukan",
       
      });
    }

    // return res.json({
    //   laporan
    // })

    if (laporan.laporan !== null) {
      laporan.laporan = JSON.parse(laporan?.laporan);
    }

    return res.json({
      status: "Success",
      msg: "Laporan ditemukan",
      data: laporan,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const simpanLaporanGuruPiket = async (req, res) => {
  try {
    req.body.laporan = JSON.stringify(req.body.laporan);
    req.body.status = 1;
    const check = await LaporanGuruPiketModel.findOne({
      where: {
        id: req.body.id,
        teacher_id: req.teacher_id,
      },
    });

    if (check === null) {
      return res.status(422).json({
        status: "Fail",
        msg: "Anda tidak memiliki akses untuk laporan dengan id ini",
      });
    }

    const payload = req.body;

    LaporanGuruPiketModel.update(payload, {
      where: {
        id: payload.id,
      },
    });

    return res.json({
      status: "Success",
      msg: "Laporan berhasil disimpan",
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};

const notifikasiPiket = async (req, res) => {
  try {
    const notifikasi = await LaporanGuruPiketModel.findAll({
      // attributes: ["id", "tanggal", "kelas_id"],
      where: {
        teacher_id: req.teacher_id,
        status: 0,
      },
      include: [
        {
          model: models.ta,
          require: true,
          as: "tahun_ajaran",
          attributes: ["id", "nama_tahun_ajaran"],
        },
      ],
      order: [["tanggal", "desc"]],
      // group: ["tanggal", "kelas_id"],
    });

    return res.json({
      status: "Success",
      msg: "notifikasi Guru",
      data: notifikasi,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
module.exports = {
  listPiketHariIni,
  listGuruPiketBelumLaporan,
  simpanLaporanGuruPiket,
  getDetailLaporanGuruPiket,
  notifikasiPiket,
};

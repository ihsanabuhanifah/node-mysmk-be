const testimoni = require("../../models").testimoni_alumni;

const createTestimoni = async (req, res) => {
  const payload = req.body;

  const { nama, pekerjaan_sekarang, jurusan, testi } = payload;

  try {
    const data = await testimoni.create({
      nama,
      pekerjaan_sekarang,
      jurusan,
      testi,
    });
    return res.status(201).json({
      status: "success",
      message: "Berhasi membuat testimoni",
      data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
};
const updateTestimoni = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { nama, pekerjaan_sekarang, jurusan, testi } = payload;
    const testimoniData = await testimoni.findOne({
      where: {
        id: id,
      },
    });
    if (!testimoniData) {
      return res.status(404).json({
        status: "fail",
        message: "Testimoni tidak ditemukan",
      });
    }

    await testimoniData.update({
      nama,
      pekerjaan_sekarang,
      jurusan,
      testi,
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil memperbarui testimoni",
      data: testimoniData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      message: "Terjadi Kesalahan",
    });
  }
};

const deleteTestimoni = async (req, res) => {
  const { id } = req.params;

  try {
    const testimoniData = await testimoni.findByPk(id);
    if (!testimoniData) {
      return res.status(404).json({
        status: "fail",
        message: "Testimoni tidak ditemukan",
      });
    }

    await testimoniData.destroy();

    return res.status(200).json({
      status: "success",
      message: "Berhasil menghapus testimoni",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      message: "Terjadi Kesalahan",
    });
  }
};

const getDetailTestimoni = async (req, res) => {
  const { id } = req.params;

  try {
    const testimoniData = await testimoni.findByPk(id);
    if (!testimoniData) {
      return res.status(404).json({
        status: "fail",
        message: "Testimoni tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Berhasil mendapatkan detail testimoni",
      data: testimoniData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      message: "Terjadi Kesalahan",
    });
  }
};
const listTestimoni = async (req, res) => {
  let { page, pageSize } = req.query;
  try {
    const { rows, count } = await testimoni.findAndCountAll({
      attributes: ["id", "nama", "pekerjaan_sekarang", "jurusan", "testi"],
      limit: pageSize,
      offset: page,
    });

    return res.json({
      status: "success",
      data: rows,
      pagination: {
        totalItems: count,
        currentPage: page,
        pageSize: pageSize,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      message: "Terjadi Kesalahan",
    });
  }
};
module.exports = {
  createTestimoni,
  updateTestimoni,
  deleteTestimoni,
  getDetailTestimoni,
  listTestimoni,
};

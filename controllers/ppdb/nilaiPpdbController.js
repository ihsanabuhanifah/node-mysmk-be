const nilaiModel = require("../../models").nilai_ppdb;

const createNilai = async (req, res) => {
  try {
    const user_id = req.id;
    const ujian_id = process.env.ID_UJIAN_PPDB;
    if (!user_id || !ujian_id) {
      return res
        .status(500)
        .json({ message: "user_id atau ujian_id tidak tersedia" });
    }
    const { jawaban, is_lulus, status } = req.body;

    const serializedJawaban = JSON.stringify(jawaban);

    const nilai = await nilaiModel.create({
      user_id,
      ujian_id,
      jawaban: serializedJawaban,
      is_lulus: is_lulus || 0,
      status: status || "open",
    });

    return res
      .status(201)
      .json({ message: "Nilai berhasil dibuat", data: nilai });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat membuat nilai",
      error: error.message,
    });
  }
};
const updateNilai = async (req, res) => {
  try {
    const { id } = req.params;
    const { jawaban, is_lulus, status } = req.body;

    const nilai = await nilaiModel.findByPk(id);

    if (!nilai) {
      return res.status(404).json({ message: "Nilai tidak ditemukan" });
    }
    if (jawaban) {
      if (!Array.isArray(jawaban)) {
        return res
          .status(400)
          .json({ message: "Jawaban harus berupa array objek" });
      }
      nilai.jawaban = JSON.stringify(jawaban);
    }

    nilai.is_lulus = is_lulus !== undefined ? is_lulus : nilai.is_lulus;
    nilai.status = status || nilai.status;

    await nilai.save();

    return res.status(200).json({
      message: "Nilai berhasil diperbarui",
      data: nilai,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui nilai",
      error: error.message,
    });
  }
};

module.exports = {
  createNilai,
  updateNilai,
};

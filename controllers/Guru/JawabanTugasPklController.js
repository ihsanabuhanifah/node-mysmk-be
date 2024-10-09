const TugasPklModel = require("../../models").tugas_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");
const dayjs = require("dayjs");
const TeacherModel = require("../../models").teacher;
const StudentModel = require("../../models").student;
const JawabanTugasPklModel = require("../../models").jawaban_tugas_pkl;

const updateStatusPesanJawaban = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const { status, pesan } = req.body;

  if (!["selesai", "revisi", "gagal"].includes(status)) {
    return {
      statusCode: 400,
      status: "error",
      message: "Status tidak valid, harus 'selesai', 'revisi', atau 'gagal'",
    };
  }

  const updated = await JawabanTugasPklModel.update(
    { status, pesan },
    { where: { id: id } }
  );

  if (updated[0] === 0 || updated === null) {
    return {
      statusCode: 404,
      status: "error",
      message: "Jawaban tidak ditemukan",
    };
  }

  return {
    statusCode: 200,
    status: "success",
    message: "Status dan pesan berhasil diupdate",
  };
});
const listJawabanSantri = response.requestResponse(async (req, res) => {
  const { page, pageSize, dariTanggal, sampaiTanggal, nama_siswa } = req.query;
  const { count, rows } = await JawabanTugasPklModel.finfindAndCountAlldAll({
    where: {
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
    },
    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
    include: [
      {
        require: true,
        model: StudentModel,
        as: "tugas_pkl",
        attributes: ["id", "nama_siswa"],

        where: {
          ...(checkQuery(nama_siswa) && {
            nama_siswa: {
              [Op.substring]: nama_siswa,
            },
          }),
        },
      },
    ],
  });

  return {
    statusCode: 200,
    status: "success",
    message: "Daftar jawaban berhasil diambil",
    data: rows,
    page: req.page,
    pageSize: pageSize,
  };
});
const detailJawabanSantri = response.requestResponse(async (req, res) => {
  const { id } = req.params;

  const jawabanDetail = await JawabanTugasPklModel.findOne({
    where: { id: id },
    include: [
      {
        model: StudentModel,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
      },
    ],
  });

  if (!jawabanDetail) {
    return {
      statusCode: 404,
      status: "error",
      message: "Jawaban tidak ditemukan",
    };
  }

  return {
    statusCode: 200,
    status: "success",
    message: "Detail jawaban berhasil diambil",
    data: jawabanDetail,
  };
});
const getJawabanByTugasPklId = response.requestResponse(async (req, res) => {
  const { tugas_pkl_id } = req.params;

  const jawabanList = await JawabanTugasPklModel.findAll({
    where: { tugas_pkl_id : tugas_pkl_id },
    include: [
      {
        model: StudentModel,
        as: "siswa",
        attributes: ["id", "nama_siswa"],
      },
    ],
  });

  if (jawabanList.length === 0) {
    return {
      statusCode: 404,
      status: "error",
      message: "Tidak ada jawaban yang ditemukan untuk tugas ini",
    };
  }

  return {
    statusCode: 200,
    status: "success",
    message: "Jawaban berhasil diambil",
    data: jawabanList,
  };
});

module.exports = {
  updateStatusPesanJawaban,
  listJawabanSantri,
  detailJawabanSantri,
  getJawabanByTugasPklId,
};

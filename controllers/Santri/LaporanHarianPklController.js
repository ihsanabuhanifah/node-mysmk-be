const LaporanHarianPklModel = require("../../models").laporan_harian_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const StudentModel = require("../../models").student;
const laporanDiniyyahModel = require("../../models").laporan_diniyyah_harian;
const { checkQuery } = require("../../utils/format");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { createLaporanDiniyyah } = require("./LaporanDiniyyahHarianController");
const createLaporanPkl = response.requestResponse(async (req, res) => {
  let payload = req.body;
  let today = dayjs(new Date()).format("YYYY-MM-DD");
  const existingLaporan = await LaporanHarianPklModel.findOne({
    where: {
      student_id: req.student_id,
      tanggal: today,
    },
  });
  if (existingLaporan) {
    return {
      statusCode: 400,
      status: "fail",
      message: "Anda hanya dapat membuat satu laporan per hari.",
    };
  }
  const laporanHarianPkl = await LaporanHarianPklModel.create({
    ...payload,
    student_id: req.student_id,
    tanggal: today,
  });

  return {
    statusCode: 201,
    status: "success",
    message: "Data Berhasil Diupload",
    data: laporanHarianPkl,
  };
});
const updateLaporanPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  let payload = req.body;
  const laporanPkl = await LaporanHarianPklModel.findOne({
    where: {
      id: id,
    },
  });
  if (laporanPkl === null) {
    return res.status(422).json({
      status: "Fail",
      msg: `Laporan Pkl dengan id ${id} tidak dapat Ditemukan`,
    });
  }
  await LaporanHarianPklModel.update(payload, {
    where: {
      id: id,
    },
  });
  return {
    statusCode: 201,
    message: `Data dengan id ${id} Berhasil Di Update`,
    data: req.body,
  };
});
// tes

const laporanPklList = response.requestResponse(async (req, res) => {
  const { page, pageSize, dariTanggal, sampaiTanggal, status_kehadiran } =
    req.query;
  const { count, rows } = await LaporanHarianPklModel.findAndCountAll({
    where: {
      student_id: req.student_id,
      ...(checkQuery(dariTanggal) && {
        tanggal: { [Op.between]: [dariTanggal, sampaiTanggal] },
      }),
      ...(checkQuery(status_kehadiran) && {
        status: status_kehadiran,
      }),
    },
    order: [["tanggal", "desc"]],
    limit: pageSize,
    offset: page,
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
      },
      {
        require: true,
        as: "laporan_diniyyah_harian",
        model: laporanDiniyyahModel,
      },
    ],
  });

  return {
    message: "Berhasil",
    data: rows,

    pagination: {
      page: req.page,
      pageSize: pageSize,
      total: count,
    },
  };
});

const detailLaporanPkl = response.requestResponse(async (req, res) => {
  const { id } = req.params;
  const laporanPkl = await LaporanHarianPklModel.findOne({
    where: {
      id: id,
    },
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["id", "nama_siswa"],
      },
      {
        require: true,
        as: "laporan_diniyyah_harian",
        model: laporanDiniyyahModel,
      },
    ],
  });
  return {
    message: `Berhasil menemukan data dengan id ${id}`,
    data: laporanPkl,
  };
});

const downloadPdf = async (req, res) => {
  const { bulan, tahun } = req.query;
  console.log("tahun", tahun);
  console.log("bulan", bulan);

  try {
    console.log("Memulai proses pembuatan PDF...");
    const reportBulanan = await LaporanHarianPklModel.findAll({
      where: {
        student_id: req.student_id,
        created_at: {
          [Op.between]: [
            new Date(tahun, bulan - 1, 1),
            new Date(tahun, bulan, 0),
          ],
        },
      },
      order: [["created_at", "ASC"]],
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Laporan_PKL_${bulan}_${tahun}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc
      .image("path/to/logo.png", 50, 45, { width: 50 }) // Ubah path ke logo sesuai dengan direktori Anda
      .fontSize(20)
      .text("Nama Instansi", 110, 57)
      .fontSize(10)
      .text("Alamat Instansi", 110, 80)
      .text("Telepon: 123-456-7890", 110, 95)
      .moveDown();

    doc.moveDown();

    doc.fontSize(20).text("Laporan PKL Bulanan", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(14)
      .text(`Bulan: ${bulan} Tahun: ${tahun}`, { align: "center" });
    doc.moveDown(2);

    const tableTop = 200;
    const itemNameX = 50;
    const itemJudulX = 200;
    const itemIsiX = 300;

    doc.fontSize(10);
    doc.text("No.", itemNameX, tableTop, { bold: true });
    doc.text("Hari", itemJudulX, tableTop, { bold: true });
    doc.text("Judul Kegiatan", itemIsiX, tableTop, { bold: true });

    let position = tableTop + 20;

    reportBulanan.forEach((report, index) => {
      doc.text(`${index + 1}`, itemNameX, position);
      doc.text(`Hari ${index + 1}`, itemJudulX, position);
      doc.text(`${report.judul_kegiatan}`, itemIsiX, position);

      position += 20; // Menambah jarak baris
    });

    doc.end();
    console.log("PDF berhasil dibuat dan dikirim");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

module.exports = {
  createLaporanPkl,
  updateLaporanPkl,
  laporanPklList,
  detailLaporanPkl,
  downloadPdf,
};

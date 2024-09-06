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

const formatDate = (date) => {
  return dayjs(date).format('DD MMMM YYYY');
};

const downloadPdf = async (req, res) => {
  const { bulan, tahun } = req.query;

  try {
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

    // Kop Surat
    doc.image("assets/kop surat laporan pkl santri api.png", {
        fit: [500, 150],
        align: 'center',
        valign: 'top'
      })
      .moveDown(2);

    // Judul dan Bulan/Tahun
    doc.fontSize(20).text("Laporan PKL Bulanan", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(14)
      .text(`Bulan: ${dayjs(new Date(tahun, bulan - 1)).format('MMMM')} Tahun: ${tahun}`, { align: "center" });
    doc.moveDown(2);

    const tableTop = 250;
    const itemNameX = 50;
    const itemJudulX = 150;
    const itemIsiX = 350;
    const itemCreatedAtX = 450;

    doc.fontSize(10);
    doc.text("No.", itemNameX, tableTop, { bold: true });
    doc.text("Hari", itemJudulX, tableTop, { bold: true });
    doc.text("Judul Kegiatan", itemIsiX, tableTop, { bold: true });
    doc.text("Tanggal Dibuat", itemCreatedAtX, tableTop, { bold: true });

    // Membuat border untuk tabel
    const tableWidth = 500;
    const rowHeight = 20;
    const colWidths = [itemJudulX - itemNameX, itemIsiX - itemJudulX, itemCreatedAtX - itemIsiX];

    const drawTableBorders = (startX, startY, colWidths, rowCount, rowHeight) => {
      doc.lineJoin('miter')
         .rect(startX, startY, tableWidth, rowHeight * rowCount)
         .stroke();
      
      // Vertical lines
      colWidths.reduce((x, width) => {
        doc.moveTo(x, startY)
           .lineTo(x, startY + rowHeight * rowCount)
           .stroke();
        return x + width;
      }, startX);

      // Horizontal lines
      for (let i = 1; i <= rowCount; i++) {
        doc.moveTo(startX, startY + rowHeight * i)
           .lineTo(startX + tableWidth, startY + rowHeight * i)
           .stroke();
      }
    };

    let position = tableTop + 20;

    reportBulanan.forEach((report, index) => {
      doc.text(`${index + 1}`, itemNameX, position);
      doc.text(`Hari ${index + 1}`, itemJudulX, position);
      doc.text(`${report.judul_kegiatan}`, itemIsiX, position);
      doc.text(formatDate(report.created_at), itemCreatedAtX, position);

      position += rowHeight;
    });

    drawTableBorders(itemNameX, tableTop, colWidths, reportBulanan.length + 1, rowHeight);

    doc.end();
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

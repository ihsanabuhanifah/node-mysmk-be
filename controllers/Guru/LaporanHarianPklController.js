const LaporanHarianPklModel = require("../../models").laporan_harian_pkl;
const { RESPONSE_API } = require("../../utils/response");
const response = new RESPONSE_API();
const { Op } = require("sequelize");
const { checkQuery } = require("../../utils/format");
const StudentModel = require("../../models").student;
const TempatPklModel = require("../../models").tempat_pkl;
const laporanDiniyyahModel = require("../../models").laporan_diniyyah_harian;

const laporanPklList = response.requestResponse(async (req, res) => {
  const {
    page,
    pageSize,
    dariTanggal,
    sampaiTanggal,
    nama_siswa,
    status_kehadiran,
  } = req.query;
  const { count, rows } = await LaporanHarianPklModel.findAndCountAll({
    where: {
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
    message: "Berhasil",
    data: rows,
    page: req.page,
    pageSize: pageSize,
  };
});

const laporanPklListForPembimbing = response.requestResponse(
  async (req, res) => {
    const tempatPklRecords = await TempatPklModel.findAll({
      where: {
        pembimbing_id: req.teacher_id,
      },
      attributes: ["student_id"],
    });
    const studentIds = tempatPklRecords.map((record) => record.student_id);
    const { page, pageSize, dariTanggal, sampaiTanggal, nama_siswa } =
      req.query;
    const { count, rows } = await LaporanHarianPklModel.findAndCountAll({
      where: {
        student_id: studentIds,
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
          as: "siswa",
          model: StudentModel,
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
      message: "Berhasil",
      data: rows,
      page: req.page,
      pageSize: pageSize,
    };
  }
);

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
// const downloadPdf = async (req, res) => {
//   const { bulan, tahun } = req.query;
//   const { studentId } = req.params;
//   try {
//     const reportBulanan = await LaporanHarianPklModel.findAll({
//       where: {
//         student_id: studentId,
//         created_at: {
//           [Op.between]: [
//             new Date(tahun, bulan - 1, 1),
//             new Date(tahun, bulan, 0),
//           ],
//         },
//       },
//       include: [
//         {
//           require: true,
//           as: "siswa",
//           model: StudentModel,
//           attributes: ["id", "nama_siswa"],
//         },
//       ],
//       order: [["created_at", "ASC"]],
//     });

//     const doc = new PDFDocument({ margin: 50 });

//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=Laporan_PKL_${bulan}_${tahun}.pdf`
//     );
//     res.setHeader("Content-Type", "application/pdf");

//     doc.pipe(res);

//     // Kop Surat
//     doc
//       .image("assets/kop_surat.png", {
//         fit: [500, 150],
//         align: "center",
//         valign: "top",
//       })
//       .moveDown(12);

//     // Judul dan Bulan/Tahun
//     doc
//       .font("Helvetica-Bold")
//       .fontSize(14)
//       .text(
//         `Laporan Jurnal PKL ${
//           reportBulanan[0].dataValues.siswa.nama_siswa
//         } ${dayjs(new Date(tahun, bulan - 1)).format("MMMM")} ${tahun}`,
//         { align: "center" }
//       )
//       .moveDown(5);

//     if (reportBulanan.length === 0) {
//       doc
//         .font("Helvetica-Bold")
//         .fontSize(12)
//         .text(
//           `Anda belum mengisi data di bulan ${dayjs(
//             new Date(tahun, bulan - 1)
//           ).format("MMMM")} ${tahun}`,
//           { align: "center" }
//         );
//       doc.end();
//       return;
//     }

//     // Table headers
//     const tableTop = 250;
//     const colWidths = [50, 200, 200, 100]; // Adjust column widths
//     const tableWidth = colWidths.reduce((a, b) => a + b, 0);
//     const startX = 50;
//     const rowHeight = 30;

//     doc
//       .fontSize(12)
//       .font("Helvetica-Bold")
//       .text("No.", startX, tableTop, { align: "center", width: colWidths[0] })
//       .text("Judul Kegiatan", startX + colWidths[0], tableTop, {
//         width: colWidths[1],
//         align: "center",
//       })
//       .text("Isi Laporan", startX + colWidths[0] + colWidths[1], tableTop, {
//         width: colWidths[2],
//         align: "center",
//       })
//       .text(
//         "Tanggal Dibuat",
//         startX + colWidths[0] + colWidths[1] + colWidths[2],
//         tableTop,
//         {
//           width: colWidths[3],
//           align: "center",
//         }
//       );

//     doc
//       .moveTo(startX, tableTop + rowHeight)
//       .lineTo(startX + tableWidth, tableTop + rowHeight)
//       .stroke();

//     const drawTableBorders = (
//       startX,
//       startY,
//       colWidths,
//       rowCount,
//       rowHeight
//     ) => {
//       doc
//         .lineJoin("miter")
//         .rect(startX, startY, tableWidth, rowHeight * rowCount)
//         .stroke();
//       colWidths.reduce((x, width) => {
//         doc
//           .moveTo(x, startY)
//           .lineTo(x, startY + rowHeight * rowCount)
//           .stroke();
//         return x + width;
//       }, startX);
//       for (let i = 1; i <= rowCount; i++) {
//         doc
//           .moveTo(startX, startY + rowHeight * i)
//           .lineTo(startX + tableWidth, startY + rowHeight * i)
//           .stroke();
//       }
//     };

//     let position = tableTop + rowHeight;

//     reportBulanan.forEach((report, index) => {
//       const dayOfMonth = dayjs(report.created_at).format("D");

//       // Adjust positions and text alignment
//       doc
//         .font("Helvetica")
//         .fontSize(10)
//         .text(`${index + 1}`, startX, position + rowHeight / 4, {
//           width: colWidths[0],
//           align: "center",
//         })
//         .text(
//           report.judul_kegiatan,
//           startX + colWidths[0],
//           position + rowHeight / 4,
//           {
//             width: colWidths[1],
//             align: "center",
//             // continued: true
//           }
//         )
//         .text(
//           report.isi_laporan,
//           startX + colWidths[0] + colWidths[1],
//           position + rowHeight / 4,
//           {
//             width: colWidths[2],
//             align: "center",
//             // continued: true
//           }
//         )
//         .text(
//           dayjs(report.created_at).format("DD MMMM YYYY"),
//           startX + colWidths[0] + colWidths[1] + colWidths[2],
//           position + rowHeight / 4,
//           {
//             width: colWidths[3],
//             align: "center",
//           }
//         );

//       position += rowHeight;
//     });

//     drawTableBorders(
//       startX,
//       tableTop + rowHeight,
//       colWidths,
//       reportBulanan.length,
//       rowHeight
//     );

//     doc.end();
//   } catch (error) {
//     console.error("Terjadi kesalahan:", error);
//     res.status(500).json({ msg: "Terjadi kesalahan pada server" });
//   }
// };
// const downloadLaporanBulanan = async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const report = await LaporanHarianPklModel.findAll({
//       where: { student_id: studentId },
//       include: [
//         {
//           require: true,
//           as: "siswa",
//           model: StudentModel,
//           attributes: ["id", "nama_siswa"],
//         },
//       ],
//       order: [["created_at", "ASC"]],
//     });

//     if (report.length === 0) {
//       return res.status(404).send("Data tidak ditemukan");
//     }

//     const firstReport = report[0].dataValues.tanggal;
//     const lastReport = report[report.length - 1].dataValues.tanggal;

//     const reportBulanan = await LaporanHarianPklModel.findAll({
//       where: {
//         student_id: req.student_id,
//         tanggal: { [Op.between]: [firstReport, lastReport] },
//       },
//     });

//     const pdfDoc = await PDFDoc.create();
//     const page = pdfDoc.addPage([600, 850]);
//     const { width, height } = page.getSize();

//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//     // Load and embed image
//     const imgPath = path.join(__dirname, "..", "..", "assets", "kop_surat.png");
//     if (!fs.existsSync(imgPath)) {
//       console.error("Image file does not exist:", imgPath);
//       return res.status(500).send("Gambar tidak ditemukan");
//     }
//     const imgBytes = fs.readFileSync(imgPath);
//     const image = await pdfDoc.embedPng(imgBytes);

//     page.drawImage(image, {
//       x: 50,
//       y: height - 200,
//       width: 500,
//       height: 150,
//     });

//     // Title and Date Range
//     page.drawText(`Laporan PKL ${report[0].dataValues.siswa.nama_siswa}`, {
//       x: 50,
//       y: height - 240,
//       size: 18,
//       font: boldFont,
//       color: rgb(0, 0, 0),
//       maxWidth: 500,
//       lineHeight: 18,
//     });

//     page.drawText(
//       `Dari tanggal ${dayjs(firstReport).format(
//         "DD MMMM YYYY"
//       )} sampai dengan tanggal ${dayjs(lastReport).format("DD MMMM YYYY")}`,
//       {
//         x: 50,
//         y: height - 260,
//         size: 14,
//         font: font,
//         color: rgb(0, 0, 0),
//         maxWidth: 500,
//         lineHeight: 18,
//       }
//     );

//     // Draw line
//     page.drawLine({
//       start: { x: 0, y: height - 280 },
//       end: { x: width, y: height - 280 },
//       thickness: 1,
//       color: rgb(0, 0, 0),
//     });

//     // Table headers
//     const colWidths = [50, 150, 250, 100];
//     const tableTop = height - 320;
//     const rowHeight = 30;

//     page.drawText("No.", { x: 50, y: tableTop, size: 12, font: boldFont });
//     page.drawText("Judul Laporan", {
//       x: 50 + colWidths[0],
//       y: tableTop,
//       size: 12,
//       font: boldFont,
//     });
//     page.drawText("Isi Laporan", {
//       x: 50 + colWidths[0] + colWidths[1],
//       y: tableTop,
//       size: 12,
//       font: boldFont,
//     });
//     page.drawText("Tanggal Dibuat", {
//       x: 50 + colWidths[0] + colWidths[1] + colWidths[2],
//       y: tableTop,
//       size: 12,
//       font: boldFont,
//     });

//     // Function to wrap text
//     function wrapText(text, maxWidth, font, size) {
//       const words = text.split(" ");
//       let lines = [];
//       let currentLine = words[0];

//       for (let i = 1; i < words.length; i++) {
//         const word = words[i];
//         const width = font.widthOfTextAtSize(currentLine + " " + word, size);

//         if (width < maxWidth) {
//           currentLine += " " + word;
//         } else {
//           lines.push(currentLine);
//           currentLine = word;
//         }
//       }
//       lines.push(currentLine);
//       return lines;
//     }

//     // Draw table rows with wrapped text
//     let yPosition = tableTop - rowHeight;
//     reportBulanan.forEach((report, index) => {
//       // Drawing row borders
//       // page.drawRectangle({
//       //   x: 50,
//       //   y: yPosition,
//       //   width: colWidths.reduce((a, b) => a + b, 0),
//       //   height: rowHeight,
//       //   borderColor: rgb(0, 0, 0),
//       //   borderWidth: 1,
//       // });

//       // Drawing text
//       page.drawText(`${index + 1}`, {
//         x: 50,
//         y: yPosition + 5,
//         size: 10,
//         font,
//       });

//       // Wrap Judul Laporan and Isi Laporan text
//       const judulLaporanLines = wrapText(
//         report.judul_kegiatan,
//         colWidths[1],
//         font,
//         10
//       );
//       const isiLaporanLines = wrapText(
//         report.isi_laporan,
//         colWidths[2],
//         font,
//         10
//       );

//       // Draw wrapped text for Judul Laporan
//       let judulLaporanY = yPosition + 5;
//       judulLaporanLines.forEach((line) => {
//         page.drawText(line, {
//           x: 50 + colWidths[0],
//           y: judulLaporanY,
//           size: 10,
//           font,
//         });
//         judulLaporanY -= 12; // Adjust for line height
//       });

//       // Draw wrapped text for Isi Laporan
//       let isiLaporanY = yPosition + 5;
//       isiLaporanLines.forEach((line) => {
//         page.drawText(line, {
//           x: 50 + colWidths[0] + colWidths[1],
//           y: isiLaporanY,
//           size: 10,
//           font,
//         });
//         isiLaporanY -= 12; // Adjust for line height
//       });

//       // Draw the date
//       page.drawText(dayjs(report.created_at).format("DD MMMM YYYY"), {
//         x: 50 + colWidths[0] + colWidths[1] + colWidths[2],
//         y: yPosition + 5,
//         size: 10,
//         font,
//       });

//       // Adjust yPosition for the next row
//       const totalLines = Math.max(
//         judulLaporanLines.length,
//         isiLaporanLines.length
//       );
//       yPosition -= rowHeight + (totalLines - 1) * 12; // Adjust for line height of wrapped text
//     });

//     // Finalize PDF and send to client
//     const pdfBytes = await pdfDoc.save();
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="Laporan_PKL_${report[0].dataValues.siswa.nama_siswa}.pdf"`
//     );
//     res.end(Buffer.from(pdfBytes));
//   } catch (error) {
//     console.error("Terjadi kesalahan:", error);
//     res.status(500).json({ msg: "Terjadi kesalahan pada server" });
//   }
// };
const downloadLaporanBulanan = response.requestResponse(async (req, res) => {
  const { studentId } = req.query;
  const report = await LaporanHarianPklModel.findAll({
    where: { student_id: studentId },
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["id", "nama_siswa"],
      },
    ],
    order: [["created_at", "ASC"]],
  });

  if (report.length === 0) {
    return res.status(404).send("Data tidak ditemukan");
  }

  const firstReport = report[0].dataValues.tanggal;
  const lastReport = report[report.length - 1].dataValues.tanggal;

  const reportBulanan = await LaporanHarianPklModel.findAll({
    where: {
      student_id: req.student_id,
      tanggal: { [Op.between]: [firstReport, lastReport] },
    },
  });
  const dataLaporan = {
    nama_siswa: report[0].dataValues.siswa.nama_siswa,
    tanggal_mulai: firstReport,
    tanggal_selesai: lastReport,
    laporan: reportBulanan.map((laporan) => ({
      judul_kegiatan: laporan.judul_kegiatan,
      isi_laporan: laporan.isi_laporan,
      tanggal_dibuat: laporan.tanggal,
      status: laporan.status,
    })),
  };
  console.log("jalan");
  return {
    message: "berhasil",
    data: dataLaporan,
  };
});
const downloadPdf = response.requestResponse(async (req, res) => {
  const { bulan, tahun, studentId } = req.query;

  const reportBulanan = await LaporanHarianPklModel.findAll({
    where: {
      student_id: studentId,
      tanggal: {
        [Op.between]: [
          new Date(tahun, bulan - 1, 1),
          new Date(tahun, bulan, 0),
        ],
      },
    },
    include: [
      {
        require: true,
        as: "siswa",
        model: StudentModel,
        attributes: ["id", "nama_siswa"],
      },
    ],
    order: [["created_at", "ASC"]],
  });
  console.log("reportttt -->", reportBulanan);

  return {
    message: "Berhasil",
    data: reportBulanan,
  };
});
module.exports = {
  laporanPklList,
  detailLaporanPkl,
  laporanPklListForPembimbing,
  downloadLaporanBulanan,
  downloadPdf,
};

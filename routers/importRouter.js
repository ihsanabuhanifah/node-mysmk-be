const express = require("express");
const importRouter = express.Router();
const upload = require("../middleware/multerExcelMiddleware");
const Tesseract = require("tesseract.js");
const dotenv = require("dotenv");
const fs = require("fs");
const {
  importRoles,
  importTa,
  importKelas,
  importMapel,
  importAlquran,
  importJadwal,
  importRombel,

  uploadImage,
  hapusFile,
} = require("../controllers/ExportImport/importController");
const {
  importGuru,
  importSiswa,
  importWali,
} = require("../controllers/ExportImport/importUserController");

const {
  referensiImport,
} = require("../controllers/ExportImport/referensiImportController");
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");
const requireAdminMiddleware = require("../middleware/requireAdminMiddleware");
const checkImportPassword = require("../middleware/checkImportPasswordMiddleware");

// Semua endpoint import hanya untuk user login dengan role Admin / Super Administrator
const importAuth = [jwtValidateMiddleware, requireAdminMiddleware];

importRouter.get("/import/referensi", importAuth, referensiImport);
importRouter.post("/import/roles", importAuth, upload.single("file"), checkImportPassword, importRoles);
importRouter.post("/import/guru", importAuth, upload.single("file"), checkImportPassword, importGuru);
importRouter.post("/import/siswa", importAuth, upload.single("file"), checkImportPassword, importSiswa);
importRouter.post("/import/wali", importAuth, upload.single("file"), checkImportPassword, importWali);
importRouter.post("/import/ta", importAuth, upload.single("file"), checkImportPassword, importTa);
importRouter.post("/import/mapel", importAuth, upload.single("file"), checkImportPassword, importMapel);
importRouter.post("/import/kelas", importAuth, upload.single("file"), checkImportPassword, importKelas);
importRouter.post("/import/alquran", importAuth, upload.single("file"), checkImportPassword, importAlquran);
importRouter.post("/import/jadwal", importAuth, upload.single("file"), checkImportPassword, importJadwal);
importRouter.post("/import/rombel", importAuth, upload.single("file"), checkImportPassword, importRombel);
importRouter.post("/upload/file", upload.single("file"), uploadImage);
importRouter.post("/delete/file", hapusFile);

importRouter.post("/soal/image", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    const imagePath = "public/data/uploads/" + req.file.filename;

    // 1. OCR dari gambar
    const result = await Tesseract.recognize(imagePath, "eng");
    const text = result.data.text;

    // 2. Prompt ke GPT

    res.json({ text: parseSoal(text), asli: text });

    // Hapus file sementara
    fs.unlinkSync(imagePath);
  } catch (err) {
    console.error(err);
    res.status(500).send("Terjadi kesalahan");
  }
});

function parseSoal(text) {
  const lines = text.split("\n");

  let pertanyaan = [];
  const pilihan = {};
  let jawaban = "";
  let currentOption = null;
  let isPertanyaan = true;

  // Regex yang lebih komprehensif
  const pilihanRegex = /^\s*([A-Ea-e8])[.)\-\s]\s*(.+)?/i;
  const jawabanRegex = /^\s*jawaban\s*[:=\-]\s*([A-Ea-e])/i;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const lineContent = originalLine.trim();

    // Deteksi pilihan (A. B. C. dst) - case insensitive
    const pilihanMatch = lineContent.match(pilihanRegex);
    if (
      pilihanMatch &&
      ["A", "B", "C", "D", "E", "a", "b", "c", "d", "e"].includes(
        pilihanMatch[1]
      )
    ) {
      let huruf = pilihanMatch[1].toUpperCase();

      currentOption = huruf;
      isPertanyaan = false;
      pilihan[currentOption] = (pilihanMatch[2] || "").trim();
      continue;
    }

    // Deteksi jawaban
    const jawabanMatch = lineContent.match(jawabanRegex);
    if (jawabanMatch) {
      jawaban = jawabanMatch[1].toUpperCase();
      currentOption = null;
      continue;
    }

    // Logika penempatan konten
    if (isPertanyaan) {
      pertanyaan.push(originalLine);
    } else if (currentOption) {
      pilihan[currentOption] +=
        (pilihan[currentOption] ? "\n" : "") + originalLine;
    }
  }

  // Format output akhir
  return {
    pertanyaan: pertanyaan.join("\n").trim(),
    pilihan: Object.keys(pilihan)
      .sort()
      .reduce((acc, key) => {
        acc[key] = pilihan[key].trim();
        return acc;
      }, {}),
    jawaban,
  };
}

module.exports = importRouter;

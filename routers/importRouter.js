const express = require("express");
const importRouter = express.Router();
const upload = require("../middleware/multerExcelMiddleware");
const Tesseract = require('tesseract.js');
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


importRouter.post("/import/roles", upload.single("file"), importRoles);
importRouter.post("/import/guru", upload.single("file"), importGuru);
importRouter.post("/import/siswa", upload.single("file"), importSiswa);
importRouter.post("/import/wali", upload.single("file"), importWali);
importRouter.post("/import/ta", upload.single("file"), importTa);
importRouter.post("/import/mapel", upload.single("file"), importMapel);
importRouter.post("/import/kelas", upload.single("file"), importKelas);
importRouter.post("/import/alquran", upload.single("file"), importAlquran);
importRouter.post("/import/jadwal", upload.single("file"), importJadwal);
importRouter.post("/import/rombel", upload.single("file"), importRombel);
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
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  let pertanyaan = '';
  const pilihan = {};
  let jawaban = '';

  const pilihanRegex = /^([A-E8])[\.\:\-\=\s]+(.+)/i; // 8 bisa jadi OCR dari B
  const jawabanRegex = /jawaban[^A-Z0-9]*[:=\s]*([A-E])/i;

  for (const line of lines) {
    const jawabanMatch = line.match(jawabanRegex);
    if (jawabanMatch) {
      jawaban = jawabanMatch[1].toUpperCase();
      continue;
    }

    const pilihanMatch = line.match(pilihanRegex);
    if (pilihanMatch) {
      let huruf = pilihanMatch[1].toUpperCase();
      if (huruf === '8') huruf = 'B'; // Koreksi OCR
      pilihan[huruf] = pilihanMatch[2].trim();
      continue;
    }

    // Anggap baris bukan pilihan atau jawaban sebagai bagian pertanyaan
    if (!line.toLowerCase().startsWith("soal")) {
      pertanyaan += (pertanyaan ? ' ' : '') + line;
    }
  }

  return {
    pertanyaan: pertanyaan.trim(),
    pilihan,
    jawaban
  };
}



module.exports = importRouter;

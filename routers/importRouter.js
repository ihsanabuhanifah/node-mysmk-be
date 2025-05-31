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
  const lines = text.split('\n');
  
  let pertanyaan = [];
  const pilihan = {};
  let jawaban = '';
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
    if (pilihanMatch && ['A','B','C','D','E','8','a','b','c','d','e'].includes(pilihanMatch[1])) {
      let huruf = pilihanMatch[1].toUpperCase();
      if (huruf === '8') huruf = 'B';
      
      currentOption = huruf;
      isPertanyaan = false;
      pilihan[currentOption] = (pilihanMatch[2] || '').trim();
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
      pilihan[currentOption] += (pilihan[currentOption] ? '\n' : '') + originalLine;
    }
  }

  // Format output akhir
  return {
    pertanyaan: pertanyaan.join('\n').trim(),
    pilihan: Object.keys(pilihan).sort().reduce((acc, key) => {
      acc[key] = pilihan[key].trim();
      return acc;
    }, {}),
    jawaban
  };
}
// function parseSoal(text) {
//   const lines = text.split('\n');
  
//   let pertanyaan = [];
//   const pilihan = {};
//   let jawaban = '';
//   let foundFirstOption = false;

//   const pilihanRegex = /^([A-E])[\.\:\-\=\s]+(.+)/i;
//   const jawabanRegex = /jawaban[^A-Z0-9]*[:=\s]*([A-E])/i;

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
    
//     // Jika menemukan pola pilihan jawaban (A., B., etc)
//     const pilihanMatch = line.match(pilihanRegex);
//     if (pilihanMatch) {
//       foundFirstOption = true;
//       const huruf = pilihanMatch[1].toUpperCase();
//       pilihan[huruf] = pilihanMatch[2].trim();
//       continue;
//     }

//     // Jika menemukan pola jawaban
//     const jawabanMatch = line.match(jawabanRegex);
//     if (jawabanMatch) {
//       jawaban = jawabanMatch[1].toUpperCase();
//       continue;
//     }

//     // Jika belum menemukan pilihan pertama, masukkan ke pertanyaan
//     if (!foundFirstOption) {
//       pertanyaan.push(lines[i]); // Gunakan line asli (dengan trim hanya untuk pemeriksaan)
//     }
//   }

//   return {
//     pertanyaan: pertanyaan.join('\n').trim(),
//     pilihan,
//     jawaban
//   };
// }


module.exports = importRouter;

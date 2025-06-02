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

importRouter.post(
  "/api/telegram-upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const { file } = req;
      const { caption } = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      console.log("process.env.TELEGRAM_BOT_TOKE", process.env.TELEGRAM_CHAT_ID)
      console.log("token", process.env.TELEGRAM_BOT_TOKEN);

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const formData = new FormData();
      formData.append("chat_id", process.env.TELEGRAM_CHAT_ID);
      if (caption) formData.append("caption", caption);

      // Tentukan endpoint dan field name berdasarkan tipe file
      let endpoint, fieldName;

      if (file.mimetype.startsWith("image/")) {
        endpoint = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        fieldName = "photo";
      } else if (file.mimetype.startsWith("video/")) {
        endpoint = `https://api.telegram.org/bot${botToken}/sendVideo`;
        fieldName = "video";
        // Optional: Tambahan parameter untuk video
        formData.append("supports_streaming", "true");
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      formData.append(fieldName, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await axios.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      res.json({
        success: true,
        result: response.data.result,
        file_id:
          response.data.result.document?.file_id ||
          response.data.result.photo?.[0]?.file_id ||
          response.data.result.video?.file_id,
      });
    } catch (error) {
      console.error("Upload error:", error.response?.data || error.message);
      res.status(500).json({
        error: "Failed to upload file",
        details: error.response?.data?.description || error.message,
      });
    }
  }
);

module.exports = importRouter;

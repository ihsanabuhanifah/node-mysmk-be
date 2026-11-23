const express = require("express");
const multer = require("multer");
const path = require("path");
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");
const { sendDocument, fetchFile } = require("../utils/telegram");

const telegramRouter = express.Router();

// Bot API hanya bisa mengunduh file maks. 20 MB, jadi batasi upload di angka yang sama
const MAX_SIZE = 20 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_SIZE } });

const FILE_ID_RE = /^[A-Za-z0-9_-]{10,200}$/;

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

// POST /telegram/upload  (multipart, field "file") -> { file_id, url }
telegramRouter.post("/telegram/upload", jwtValidateMiddleware, (req, res) => {
  upload.single("file")(req, res, async (uploadErr) => {
    if (uploadErr) {
      const msg =
        uploadErr.code === "LIMIT_FILE_SIZE" ? "Ukuran file maksimal 20 MB" : "Upload file gagal";
      return res.status(400).json({ status: "fail", msg });
    }
    if (!req.file) return res.status(400).json({ status: "fail", msg: "File tidak ada" });

    try {
      const fileId = await sendDocument({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        caption: req.body?.caption || `File dari ${req.name || "MySMK"}`,
      });
      return res.json({ status: "Success", file_id: fileId, url: `/telegram/file/${fileId}` });
    } catch (err) {
      console.log("telegram upload", err.message);
      return res.status(502).json({ status: "fail", msg: "Gagal mengirim file" });
    }
  });
});

// GET /telegram/file/:fileId -> isi file (publik, agar bisa dipakai di <img>/<video>)
telegramRouter.get("/telegram/file/:fileId", async (req, res) => {
  const { fileId } = req.params;
  if (!FILE_ID_RE.test(fileId)) return res.status(400).json({ status: "fail", msg: "file_id tidak valid" });

  try {
    const file = await fetchFile(fileId);
    const ext = path.extname(file.filePath || "").toLowerCase();
    // Hanya tipe di whitelist yang ditampilkan inline; selain itu dipaksa jadi unduhan
    // (mencegah file HTML/SVG dijalankan di domain API).
    const type = MIME_BY_EXT[ext];
    res.setHeader("Content-Type", type || "application/octet-stream");
    if (!type) res.setHeader("Content-Disposition", `attachment; filename="${path.basename(file.filePath || "file")}"`);
    if (file.contentLength) res.setHeader("Content-Length", file.contentLength);
    // isi file untuk satu file_id tidak pernah berubah
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    file.stream.on("error", () => res.destroy());
    file.stream.pipe(res);
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.log("telegram file", err.message);
    return res.status(status).json({ status: "fail", msg: "File tidak dapat diambil" });
  }
});

module.exports = telegramRouter;

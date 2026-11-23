// Integrasi Telegram Bot dijalankan di backend agar BOT TOKEN tidak pernah sampai ke browser.
// File dikirim ke chat Telegram sebagai dokumen, lalu diambil kembali lewat file_id
// melalui endpoint proxy (GET /telegram/file/:fileId).
const { Readable } = require("stream");

const API = "https://api.telegram.org";

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diatur di .env");
  }
  return { token, chatId };
}

/** Kirim file sebagai dokumen. @returns file_id */
async function sendDocument({ buffer, filename, mimetype, caption }) {
  const { token, chatId } = getConfig();
  const form = new FormData();
  form.append("chat_id", chatId);
  if (caption) form.append("caption", caption);
  form.append("document", new Blob([buffer], { type: mimetype }), filename);

  const res = await fetch(`${API}/bot${token}/sendDocument`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(`Telegram sendDocument gagal: ${data.description || res.status}`);
  }
  const r = data.result || {};
  const fileId =
    r.document?.file_id || r.video?.file_id || r.audio?.file_id || r.photo?.[r.photo.length - 1]?.file_id;
  if (!fileId) throw new Error("Telegram tidak mengembalikan file_id");
  return fileId;
}

/** Ambil isi file dari Telegram. @returns { stream, contentType, contentLength } */
async function fetchFile(fileId) {
  const { token } = getConfig();
  const info = await fetch(`${API}/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`);
  const data = await info.json().catch(() => ({}));
  if (!info.ok || !data.ok || !data.result?.file_path) {
    const err = new Error(data.description || "File tidak ditemukan");
    err.status = 404;
    throw err;
  }

  const file = await fetch(`${API}/file/bot${token}/${data.result.file_path}`);
  if (!file.ok || !file.body) {
    const err = new Error("Gagal mengambil file dari Telegram");
    err.status = 502;
    throw err;
  }
  return {
    stream: Readable.fromWeb(file.body),
    contentLength: file.headers.get("content-length"),
    filePath: data.result.file_path,
  };
}

module.exports = { sendDocument, fetchFile };

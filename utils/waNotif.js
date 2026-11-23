// Kirim notifikasi ke grup WhatsApp sekolah (URL_WA / TOKEN_WA / GROUP_WA).
// Dijalankan di belakang: kegagalan WA tidak boleh menggagalkan request utama.
const { default: axios } = require("axios");

function kirimWaGrup(pesan) {
  const urlAPI = process.env.URL_WA;
  const token = process.env.TOKEN_WA;
  const nomer = process.env.GROUP_WA;
  if (!urlAPI || !token || !nomer) return;

  axios
    .post(
      urlAPI,
      { phone: nomer, message: pesan, isGroup: true },
      { headers: { Authorization: token, "Content-Type": "application/json" }, timeout: 15000 }
    )
    .catch((err) => console.log("notif WA gagal", err?.response?.status || err?.message));
}

/** Tanggal valid format YYYY-MM-DD. */
const isTanggal = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));

module.exports = { kirimWaGrup, isTanggal };

// validateFields.js
const validFields = [
  "nama_siswa",
  "nis",
  "nisn",
  "nik",
  "tempat_lahir",
  "tanggal_lahir",
  "alamat",
  "sekolah_asal",
  "jenis_kelamin",
  "anak_ke",
  "nama_ayah",
  "nama_ibu",
  "pekerjaan_ayah",
  "pekerjaan_ibu",
  "nama_wali",
  "pekerjaan_wali",
  "hubungan",
  "kk",
  "ijazah",
  "akte",
  "skb",
  "surat_pernyataan"
];

const validateFields = (req, res, next) => {
  const invalidFields = Object.keys(req.body).filter(
    (field) => !validFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      status: "Error",
      msg: `Field yang anda kirim tidak ada: ${invalidFields.join(", ")}`,
    });
  }

  next();
};

module.exports = validateFields;

// Status akun (users.status) yang TIDAK boleh login / memakai aplikasi.
// Status "inactive" yang sudah ada di data lama (Calon PPDB, sebagian siswa/guru)
// sengaja TIDAK diblokir agar tidak mengubah perilaku akun-akun tersebut.
const STATUS_PINDAH_SEKOLAH = "pindah"; // siswa pindah sekolah
const STATUS_DIBLOKIR = "diblokir"; // dinonaktifkan admin (mis. guru nonaktif)

const PESAN = {
  [STATUS_PINDAH_SEKOLAH]:
    "Akun tidak aktif karena siswa telah pindah sekolah. Hubungi admin sekolah bila ini keliru.",
  [STATUS_DIBLOKIR]:
    "Akun Anda telah dinonaktifkan oleh admin sekolah. Hubungi admin bila ini keliru.",
};

const isAkunDiblokir = (status) => Object.keys(PESAN).includes(String(status || ""));
const pesanAkunDiblokir = (status) => PESAN[String(status || "")] || PESAN[STATUS_DIBLOKIR];

// Kompatibilitas dengan kode lama
const PESAN_AKUN_DIBLOKIR = PESAN[STATUS_PINDAH_SEKOLAH];

module.exports = {
  STATUS_PINDAH_SEKOLAH,
  STATUS_DIBLOKIR,
  PESAN_AKUN_DIBLOKIR,
  isAkunDiblokir,
  pesanAkunDiblokir,
};

class RESPONSE_API {
  requestResponse(handler) {
    return async (req, res, next) => {
      try {
        const response = await handler(req, res, next);

        // Handler sudah mengirim respons sendiri / tidak mengembalikan apa-apa
        if (res.headersSent) return;
        if (!response) {
          return res.status(422).json({
            status: "Warning",
            msg: "Permintaan tidak dapat diproses",
          });
        }

        if (response.statusCode === 422) {
          return res.status(422).json({
            status: "Warning",
            ...response,
          });
        }

        // Akses ditolak (mis. data milik guru lain) -> HTTP 403 sungguhan.
        // Catatan: kode 400/404/500 lama sengaja belum diubah (masih HTTP 200)
        // agar perilaku halaman lain (PKL) tidak berubah.
        if (response.statusCode === 403) {
          return res.status(403).json({
            status: "Fail",
            ...response,
          });
        }

        return res.json({
          status: "Success",
          msg: "Data berhasil di update",
          ...response,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          msg: "Terjadi Kesalahan",
          error: err.message,
        });
      }
    };
  }
}

module.exports = { RESPONSE_API };

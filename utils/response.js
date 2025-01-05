class RESPONSE_API {
  requestResponse(handler) {
    return async (req, res, next) => {
      try {
        const response = await handler(req, res, next);

        

        if (response.statusCode === 422) {
          return res.status(422).json({
            status: "Warning",
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

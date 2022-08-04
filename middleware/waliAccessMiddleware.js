async function guruAccessMiddleware(req, res, next) {
  if (req.role !== "Wali Siswa") {
    return res.status(403).json({
      status: "Fail",
      msg: "Anda tidak dapat memiliki access sebagai Wali Siswa",
    });
  }

  next();
}

module.exports = guruAccessMiddleware;

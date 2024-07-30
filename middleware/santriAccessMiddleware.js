async function santriAccessMiddleware(req, res, next) {
  if (req.role !== "Santri") {
    return res.status(403).json({
      status: "Fail",
      msg: "Anda tidak dapat memiliki access sebagai Santri",
    });
  }

  next();
}

module.exports = santriAccessMiddleware;

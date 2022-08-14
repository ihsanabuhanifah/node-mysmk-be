async function guruAccessMiddleware(req, res, next) {
  if (req.role === "Guru" || req.role === "Musyrif") {
    next();
  } else {
    return res.status(403).json({
      status: "Fail",
      msg: "Anda tidak dapat memiliki access sebagai guru",
    });
  }
}

module.exports = guruAccessMiddleware;

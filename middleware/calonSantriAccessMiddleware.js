async function calonSantriAccessMiddleware(req, res, next) {
  if (req.role === "Calon Santri") {
    next();
  } else {
    return res.status(403).json({
      status: "Fail",
      msg: "Anda tidak dapat memiliki access sebagai Calon Santri",
    });
  }
}

module.exports = calonSantriAccessMiddleware;

async function calonSantriAccessMiddleware(req, res, next) {

  console.log("role", req.role);
  if (req.role === "Calon Santri" || req.role === "Calon") {
    next();
  } else {
    return res.status(403).json({
      status: "Fail",
      msg: "Anda tidak dapat memiliki access sebagai Calon Santri",
    });
  }
}

module.exports = calonSantriAccessMiddleware;

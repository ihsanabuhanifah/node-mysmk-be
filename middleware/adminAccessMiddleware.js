async function adminAccessMiddleware(req, res, next) {
  console.log("role", req.role);
  if (req.allRole.includes("Admin")) {
    next();
  } else {
    return res.status(403).json({
      status: "Fail",
      msg: "Anda tidak dapat memiliki access sebagai Admin",
    });
  }
}

module.exports = adminAccessMiddleware;

const JWT = require("jsonwebtoken");
const dotenv = require("dotenv").config()
const UserModel = require("../models").User
const jwtValidateMiddleware =  (req, res, next) => {
  const bearerHeader = req.headers["x-authorization"];
  if(!bearerHeader) return res.sendStatus(401)
  const bearerToken = bearerHeader.split(" ")[1];
  JWT.verify(bearerToken, process.env.JWT_SECRET_ACCESS_TOKEN, async(err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid Token",
        data: err,
      });
    } else {

      console.log(decoded)
      req.id = decoded.id;
      req.email = decoded.email;
      req.name = decoded.name
      req.role = decoded.role
      req.roleId = decoded.roleId
      req.StudentId = decoded?.StudentId
      req.semesterAktif = decoded?.semesterAktif,
      req.tahunAjaranAktif = decoded?.tahunAjaranAktif
      const user = await UserModel.findByPk(decoded.id)
     if (user === null) return res.status(404).json({
       status : "Fail",
       message : "User tidak ditemukan"
     })

      next();
    }
  });
};

module.exports = jwtValidateMiddleware;
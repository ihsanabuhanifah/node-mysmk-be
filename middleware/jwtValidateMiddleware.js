const JWT = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const UserModel = require("../models").user;
const jwtValidateMiddleware = (req, res, next) => {
  const bearerHeader = req.headers["x-authorization"];
  if (!bearerHeader) return res.sendStatus(401);
  const bearerToken = bearerHeader.split(" ")[1];
  JWT.verify(
    bearerToken,
    process.env.JWT_SECRET_ACCESS_TOKEN,
    async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: "fail",
          message: "Invalid Token",
          data: err,
        });
      } else {
        req.id = decoded.id;
        req.email = decoded.email;
        req.name = decoded.name;
        req.role = decoded.role;
        req.roleId = decoded.roleId;
        req.nama_siswa = decoded?.nama_siswa;
        req.StudentId = decoded?.StudentId;

        (req.semesterAktif = decoded?.semesterAktif),
          (req.tahunAjaranAktif = decoded?.tahunAjaranAktif),
          (req.teacher_id = decoded?.teacher_id);

        req.allRole = decoded.allRole;
        req.student_id = decoded.student_id;

        next();
      }
    }
  );
};

module.exports = jwtValidateMiddleware;

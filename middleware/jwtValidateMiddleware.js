const JWT = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const UserModel = require("../models").user;
const jwtValidateMiddleware = (req, res, next) => {
  const bearerHeader = req.headers["x-authorization"];
  if (!bearerHeader) return res.sendStatus(401);
  const bearerToken = bearerHeader.split(" ")[1];
  console.log("Bearer Token:", bearerToken);
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
        console.log("dec", decoded);
        req.user_id = decoded.id;
        req.email = decoded.email;
        req.name = decoded.name;
        req.role = decoded.role;
        req.roleId = decoded.roleId;
        req.StudentId = decoded?.StudentId;

        (req.semesterAktif = decoded?.semesterAktif),
          (req.tahunAjaranAktif = decoded?.tahunAjaranAktif),
          (req.teacher_id = decoded?.teacher_id);

        req.allRole = decoded.allRole;
        req.student_id = decoded.student_id;

        next();
        console.log("Token:", req.headers["x-authorization"]);
        console.log("User ID di middleware:", req.id);
        console.log("Bearer Header:", bearerHeader);
        console.log("Bearer Token:", bearerToken);
        console.log("Decoded:", decoded);
      }
    }
  );
};

module.exports = jwtValidateMiddleware;

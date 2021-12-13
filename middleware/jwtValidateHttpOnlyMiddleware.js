const JWT = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const userModel = require("../models").User;
const jwtValidateMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = await userModel.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) return res.sendStatus(403);
    JWT.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN,
      (err, decoded) => {
        if (err)
          return res.status(401).json({
            status: "fail",
            message: "Invalid Token",
            data: err,
          });

        req.id = decoded.id;
        req.email = decoded.email;

        next();
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = jwtValidateMiddleware;

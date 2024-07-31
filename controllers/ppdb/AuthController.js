const userModel = require("../../models").user;
const models = require("../../models");
const userRoleModel = require("../../models").user_role;
const RolesModel = require("../../models").role;
const ParentModel = require("../../models").parent;
const TeacherModel = require("../../models").teacher;
const StudentModel = require("../../models").student;
const TokenModel = require("../../models").token_reset_password;
const { sequalize } = require("../../models");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { Op, where } = require("sequelize");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
const crypto = require("crypto");

async function register(req, res) {
  const payload = req.body;
  const { email, secretKey, no_hp } = payload;

  if (process.env.SECRET_KEY_REGISTER_SUPER_ADMIN !== secretKey) {
    return res.status(422).json({
      status: "Fail",
      msg: "Secret Key Salah, Anda tidak bisa mendaftar sebagai Super Admin",
    });
  }
  payload.password = await bcrypt.hashSync(req.body.password, 10);
  console.log(payload);

  try {
    await userModel.create(payload);
    const user = await userModel.findOne({
      where: {
        email: email,
      },
      attributes: ["id", "name", "email", "no_hp"],
    });

    const userRole = await userRoleModel.create({
      userId: user.id,
      roleId: 1,
    });

    const verify = bcrypt.compareSync(password, user.password);
    if (!verify) {
      return res.status(422).json({
        status: "fail",
        msg: "Email dan Pasword tidak sama",
      });
    }
    const myRoles = await RolesModel.findByPk(userRole.id);

    const token = JWT.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
        role: myRoles.roleName,
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    return res.status(201).json({
      status: "Success",
      msg: "Registrasi Berhasil",
      user: user,
      role: myRoles.roleName,
      token: token,
    });
  } catch(err) {
    console.log(err);
  }
}
module.exports = {
  register
};
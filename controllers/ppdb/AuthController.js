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
  payload.password = await bcrypt.hashSync(req.body.password, 10);
  console.log(payload);

  try {
    const existingUser = await userModel.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        msg: "Email sudah terdaftar",
      });
    }

    const existingUserByNoHp = await userModel.findOne({
      where: { no_hp: no_hp },
    });

    if (existingUserByNoHp) {
      return res.status(400).json({
        status: "fail",
        msg: "No HP sudah terdaftar",
      });
    }

    await userModel.create(payload);
    const user = await userModel.findOne({
      where: {
        email: email,
        // no_hp: no_hp,
      },
      attributes: ["id", "name", "email", "no_hp"],
    });

    const userRole = await userRoleModel.create({
      user_id: user.id,
      role_id: 11,
    });

    console.log(user, userRole);
    return res.status(201).json({
      status: "Success",
      msg: "Registrasi Berhasil",
    });
  } catch (err) {
    console.log(err);
  }
}

async function login(req, res) {
  try {
    let { email, no_hp, password, loginAs } = req.body;

    if (!email && !no_hp) {
      return res.status(400).json({
        status: "fail",
        msg: "Email atau no HP harus disediakan",
      });
    }

    console.log("email :", email);
    console.log("no hp :", no_hp);

    const user = await userModel.findOne({
      where: {
        [Op.or]: [email && { email: email }, no_hp && { no_hp: no_hp }].filter(
          Boolean
        ),
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        msg: "User tidak ditemukan",
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(422).json({
        status: "fail",
        msg: "Password tidak sesuai",
      });
    }

    const roleName = await RolesModel.findByPk(loginAs);
    if (!roleName) {
      return res.status(422).json({
        status: "fail",
        msg: "Role tidak ditemukan",
      });
    }

    const checkRole = await userRoleModel.findOne({
      attributes: ["id", "role_id"],
      where: {
        [Op.and]: [{ user_id: user.id }, { role_id: loginAs }],
      },
    });

    console.log(`role:`, roleName.role_name);

    if (!checkRole) {
      return res.status(422).json({
        status: "fail",
        msg: `Anda tidak memiliki role sebagai ${roleName.role_name}`,
      });
    }
    const token = JWT.sign(
      {
        email: user.email,
        name: user.name,
        no_hp: user.no_hp,
        id: user.id,
        role: roleName.role_name,
        roleId: loginAs,
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      { expiresIn: "7d" }
    );

    const response = {
      status: "success",
      msg: "Berhasil Login",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        no_hp: user.no_hp,
        role: roleName.role_name,
      },
      token: token,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
module.exports = {
  register,
  login,
};

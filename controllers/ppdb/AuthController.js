const userModel = require("../../models").user;
const models = require("../../models");
const userRoleModel = require("../../models").user_role;
const RolesModel = require("../../models").role;
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { Op, where } = require("sequelize");
const { QueryTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

async function register(req, res) {
  const payload = req.body;
  const { email, secretKey, no_hp, infoSource } = payload;
  payload.password = await bcrypt.hashSync(req.body.password, 10);
  console.log(`user:`, payload);

  try {
    const existingUserByEmail = await userModel.findOne({
      where: { email: email },
    });

    if (existingUserByEmail) {
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

    const newUser = await userModel.create({
      ...payload,
      role: "Calon",
      informasi: infoSource.toString(),
    });

    await userRoleModel.create({
      user_id: newUser.id,
      role_id: 12,
    });

    console.log(`User created and role assigned`);
    return res.status(201).json({
      status: "Success",
      msg: "Registrasi Berhasil",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function login(req, res) {
  try {
    let { email, no_hp, password } = req.body;

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
    const userRole = await userRoleModel.findOne({
      where: { user_id: user.id },
      include: {
        model: RolesModel,
        as: "role",
        attributes: ["role_name"],
      },
    });
    const roleName =
      userRole && userRole.role
        ? userRole.role.role_name
        : "Role tidak ditemukan";

    console.log(`role:`, roleName);

    const token = JWT.sign(
      {
        email: user.email,
        name: user.name,
        no_hp: user.no_hp,
        id: user.id,
        role: roleName,
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
        role: roleName,
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

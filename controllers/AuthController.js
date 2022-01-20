const userModel = require("../models").user;
const userRoleModel = require("../models").user_role;
const RolesModel = require("../models").role;
const KelasStudentModel = require("../models").kelas_student;
const ParentModel = require("../models").parent;

const TokenModel = require("../models").token_reset_password;

const { sequelize } = require("../models");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { Op, where } = require("sequelize");
const { QueryTypes } = require("sequelize");
generator = require("generate-password");
const dotenv = require("dotenv");
dotenv.config();
const sendEmail = require("../utils/email");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require("crypto");

async function login(req, res) {
  try {
    let { email, password, loginAs } = req.body;
    const user = await userModel.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        msg: "Email tidak ditemukan",
      });
    }
    const verify = bcrypt.compareSync(password, user.password);
    if (!verify) {
      return res.status(404).json({
        status: "fail",
        msg: "Email dan Pasword tidak sama",
      });
    }

    const roleName = await RolesModel.findByPk(loginAs);

    const checkRole = await userRoleModel.findOne({
      where: {
        [Op.and]: [{ user_id: user.id }, { role_id: loginAs }],
      },
    });

    if (checkRole === null) {
      return res.status(422).json({
        status: "Fail",
        msg: `Mohon Maaf anda tidak memiliki role sebagai ${roleName.roleName}  `,
      });
    }
    let parent;
    let KelasStudent;
    if (loginAs === 8) {
      parent = await ParentModel.findOne({
        where: {
          user_id: user.id,
        },
      });
    }
   console.log('parent' ,parent)
    if ( parent !== null && parent !== undefined) {
      KelasStudent = await sequelize.query(
        `SELECT semester , tahun_ajaran FROM kelas_students 
        WHERE student_id = ${parent?.studentId}`,
        {
          type: QueryTypes.SELECT,
        }
      );
    }
    

    const token = JWT.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
        role: roleName.role_name,
        roleId: loginAs,
        StudentId: parent?.student_id,
        semesterAktif:
          parent?.student_id !== undefined ? KelasStudent[0]?.semester : "",
        tahunAjaranAktif:
          parent?.student_id !== undefined ? KelasStudent[0]?.tahun_ajaran : "",
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );

    if (loginAs === 8) {
      return res.status(200).json({
        status: "Success",
        msg: "Berhasil Login",
        user: user,
        role: roleName.role_name,
        token: token,
        semesterAktif: KelasStudent[0]?.semester,
        tahunAjaranAktif: KelasStudent[0]?.semester,
      });
    }

    return res.status(200).json({
      status: "Success",
      msg: "Berhasil Login",
      user: user,
      role: roleName.roleName,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function register(req, res) {
  const payload = req.body;
  const { email, secretKey } = payload;
  if (process.env.SECRET_KEY_REGISTER_SUPER_ADMIN !== secretKey) {
    return res.status(422).json({
      status: "Fail",

      msg: "Secret Key Salah, Anda tidak bisa mendaftar sebagai Super Admin",
    });
  }
  payload.password = await bcrypt.hashSync(req.body.password, 10);
  try {
    await userModel.create(payload);

    const user = await userModel.findOne({
      where: {
        email: email,
      },
      attributes: ["id", "name", "email"],
    });

    const userRole = await userRoleModel.create({
      userId: user.id,
      roleId: 1,
    });

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

    // const token = {
    //   UserId: user.id,
    //   token: generator.generate({
    //     length: 100,
    //     numbers: true,
    //   }),
    // };
    // const message = `http://localhost:8000/users/verify/${user.id}/${token.token}`;
    // const kirim = await sendEmail(email, "Verify Email", message);
    // if (kirim === "email not sent")
    //   return res.json({
    //     status: "fail",
    //     message: "Gunaka email valid",
    //   });

    // await EmailVerifiedModel.create(token);
    // console.log(morgan("user-agent"))
    // await LoginHistory.create({
    //   UserId: user.id,
    //   device: morgan(":user-agent"),
    // });
    return res.status(201).json({
      status: "Success",
      msg: "Registrasi Berhasil",
      user: user,
      role: myRoles.roleName,
      token: token,
    });
  } catch (err) {
    console.log(err);
  }
}

async function authme(req, res) {
  let name = req.name;
  let id = req.id;
  let email = req.email;

  try {
    const user = await userModel.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        msg: "Email tidak ditemukan",
      });
    }

    const token = JWT.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
        role: user.role,
        roleId: user.Role_id,
        StudentId: req.Student_id,
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    if (req.role === "wali") {
      return res.status(200).json({
        status: "Success",
        msg: "Berhasil Authme",
        user: user,
        role: req.role,
        token: token,
        semesterAktif: req?.semesterAktif,
        tahunAjaranAktif: req?.tahunAjaranAktif,
      });
    }
    return res.status(200).json({
      status: "Success",
      msg: "Berhasil Authme",
      user: user,
      role: req.role,
      token: token,
    });
  } catch (err) {
    console.log(err);
  }
}

async function googleRegister(req, res) {
  const { tokenId } = req.body;
  const data = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, email_verified, name, picture } = data.payload;
  let password = generator.generate({
    length: 100,
    numbers: true,
  });
  const users = await userModel.findOne({
    where: {
      email: email,
    },
  });
  if (users !== null)
    return res.status(422).json({
      status: "Email sudah terdaftar",
    });
  await userModel.create({
    email: email,
    name: name,
    image: picture,
    email_verified: email_verified,
    password: password,
  });

  const user = await userModel.findOne({
    where: {
      email: email,
    },
  });

  const token = JWT.sign(
    {
      email: user.email,
      name: user.name,
      id: user.id,
    },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: "7d",
    }
  );

  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   maxAge: 7 * 24 * 60 * 60 * 6000,
  //   secure: process.env.NODE_ENV === "production",
  // });
  return res.status(200).json({
    status: "Success",
    msg: "Registrasi Berhasil",
    user: user,
    token: token,
  });
}

async function googleLogin(req, res) {
  const { tokenId } = req.body;
  const data = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email } = data.payload;

  const users = await userModel.findOne({
    where: {
      email: email,
    },
  });
  if (users === null)
    return res.status(422).json({
      status: "Email belum terdaftar",
    });

  const token = JWT.sign(
    {
      email: users.email,
      name: users.name,
      id: users.id,
    },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    {
      expiresIn: "7d",
    }
  );

  return res.status(200).json({
    status: "Success",
    msg: "Berhasil Login",
    user: users,
    token: token,
  });
}

async function logout(req, res) {
  return res.clearCookie("refreshToken").status(200).json({
    status: "Success",
    message: "Anda telah berhasil logout",
  });
}
async function resetPassword(req, res) {
  try {
    let { oldPassword, newPassword } = req.body;
    let email = req.email;
    const user = await userModel.findOne({
      where: {
        email: email,
      },
    });
    const verify = bcrypt.compareSync(oldPassword, user.password);
    if (!verify) {
      return res.status(404).json({
        status: "fail",
        msg: "Masukan Password Lama ",
      });
    }

    newPassword = await bcrypt.hashSync(newPassword, 10);
    const update = await userModel.update(
      {
        password: newPassword,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    console.log(update);
    return res.status(201).json({
      status: "Success",
      msg: "Password berhasil di perbaharui",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

async function forgotPassword(req, res) {
  let { email } = req.body;

  const user = await userModel.findOne({
    where: {
      email: email,
    },
  });

  console.log(user);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      msg: "Email tidak ditemukan, Silahkan gunakan Email yang terdaftar",
    });
  }
  let token = crypto.randomBytes(32).toString("hex");
  const tokenSave = await TokenModel.create({
    userId: user.id,
    token: token,
  });

  const link = `${process.env.BASE_URL}/resetPassword/${user.id}/${token}`;
  await sendEmail(user.email, "Password Reset", link);
  return res.json({
    status: "Success",
    msg: "Silahkan Periksa Email Masuk",
  });
}

async function resetPasswordEmail(req, res) {
  let { UserId, token } = req.params;
  let { newPassword } = req.body;
  const verify = await TokenModel.findOne({
    where: {
      [Op.and]: [{ userId: UserId }, { token: token }],
    },
  });

  if (verify === null) {
    return res.json({
      status: "fail",
      msg: "Token tidak Valid",
    });
  }

  newPassword = await bcrypt.hashSync(newPassword, 10);
  await userModel.update(
    {
      password: newPassword,
    },
    {
      where: {
        id: UserId,
      },
    }
  );

  await TokenModel.destroy({
    where: {
      userId: UserId,
    },
  });

  
  return res.status(201).json({
    status: "Success",
    msg: "Password berhasil di perbaharui",
  });

 
  return res.json({
    status: verify,
  });
}
module.exports = {
  login,
  logout,
  register,
  authme,
  googleRegister,
  googleLogin,
  resetPassword,
  forgotPassword,
  resetPasswordEmail,
};

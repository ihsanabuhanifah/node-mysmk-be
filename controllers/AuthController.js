const userModel = require("../models").User;
const userRoleModel = require("../models").UserRole;
const RolesModel = require("../models").Role;
const KelasStudentModel = require("../models").KelasStudent;
const ParentModel = require("../models").Parent;
const EmailVerifiedModel = require("../models").EmailVerified;
const LoginHistory = require("../models").LoginHistory;
const { sequelize } = require("../models");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { Op } = require("sequelize");
const { QueryTypes } = require("sequelize");
generator = require("generate-password");
const dotenv = require("dotenv");
dotenv.config();
const sendEmail = require("../utils/email");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        [Op.and]: [{ UserId: user.id }, { RoleId: loginAs }],
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
          UserId: user.id,
        },
      });
    }
    console.log("ee", parent);
    if (parent !== undefined) {
      KelasStudent = await sequelize.query(
        `SELECT semester , tahunAjaran FROM KelasStudents 
        WHERE StudentId = ${parent?.StudentId}`,
        {
          type: QueryTypes.SELECT,
        }
      );
    }
    console.log(parent?.StudentId);

    const token = JWT.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
        role: roleName.roleName,
        roleId: loginAs,
        StudentId: parent?.StudentId,
        semesterAktif:
          parent?.StudentId !== undefined ? KelasStudent[0]?.semester : "",
        tahunAjaranAktif:
          parent?.StudentId !== undefined ? KelasStudent[0]?.tahunAjaran : "",
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );

    if(loginAs === 8) {
      return res.status(200).json({
        status: "Success",
        msg: "Berhasil Login",
        user: user,
        role: roleName.roleName,
        token: token,
        semesterAktif: KelasStudent[0]?.semester ,
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
      UserId: user.id,
      RoleId: 1,
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
        roleId: user.RoleId,
        StudentId: req.StudentId,
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );
   if(req.role === 'wali'){
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

module.exports = {
  login,
  logout,
  register,
  authme,
  googleRegister,
  googleLogin,
};

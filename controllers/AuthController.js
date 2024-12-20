const userModel = require("../models").user;
const models = require("../models");
const userRoleModel = require("../models").user_role;

const RolesModel = require("../models").role;
const KelasStudentModel = require("../models").kelas_student;
const ParentModel = require("../models").parent;
const TeacherModel = require("../models").teacher;
const StudentModel = require("../models").student;
const TokenModel = require("../models").token_reset_password;

const { sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { OAuth2Client, auth } = require("google-auth-library");
const { Op, where } = require("sequelize");
const { QueryTypes } = require("sequelize");
generator = require("generate-password");
const dotenv = require("dotenv");
dotenv.config();
const sendEmail = require("../mail");
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
      return res.status(422).json({
        status: "fail",
        msg: "Email dan Pasword tidak sama",
      });
    }

    const roleName = await RolesModel.findByPk(loginAs);

    const checkRole = await userRoleModel.findOne({
      attributes: ["id", "role_id"],
      where: {
        [Op.and]: [{ user_id: user.id }, { role_id: loginAs }],
      },
    });

    if (checkRole === null) {
      return res.status(422).json({
        status: "Fail",
        msg: `Mohon Maaf anda tidak memiliki role sebagai ${roleName.role_name}  `,
      });
    }
    let parent;
    let KelasStudent;
    let guru;
    let siswa;
    let allRole = [];

    if (loginAs === 8) {
      parent = await ParentModel.findOne({
        attributes: [
          "id",
          "nama_wali",
          "user_id",
          "student_id",
          "hubungan",
          "nama_siswa",
        ],
        where: {
          user_id: user.id,
        },
      });
    } else if (loginAs === 9) {
      siswa = await StudentModel.findOne({
        attributes: ["id"],
        where: {
          user_id: user.id,
        },
      });
    } else {
      guru = await TeacherModel.findOne({
        attributes: ["id"],
        where: {
          user_id: user.id,
        },
      });

      allRole = await userRoleModel.findAll({
        where: {
          [Op.and]: [{ user_id: user.id }],
        },

        include: [
          {
            model: models.role,
            require: true,
            as: "role",
          },
        ],
      });

      const mapRole = allRole.map((item) => {
        return item.role.role_name;
      });

      allRole = mapRole;

      console.log("allRole", user);
    }

    if (parent !== null && parent !== undefined) {
      KelasStudent = await sequelize.query(
        `SELECT  
            a.semester , 
            b.nama_tahun_ajaran as ta_id  FROM kelas_students as a
         LEFT JOIN ta AS b ON (a.ta_id = b.id)
         WHERE 
            student_id = ${parent?.student_id} AND status = 1`,
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
        nama_siswa: parent?.nama_siswa,
        student_id: siswa?.id,
        teacher_id: guru?.id,
        walsan_id : parent?.id,
        allRole: allRole,
        semesterAktif:
          parent?.student_id !== undefined ? KelasStudent[0]?.semester : "",
        tahunAjaranAktif:
          parent?.student_id !== undefined ? KelasStudent[0]?.ta_id : "",
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "360d",
      }
    );

    if (loginAs === 8) {
      if (!!parent?.student_id === false) {
        return res.status(422).json({
          status: "Fail",
          msg: `Akun dalam proses mapping antara Wali dan Siswa`,
        });
      }

      return res.status(200).json({
        status: "Success",
        msg: "Berhasil Login",
        user: user,
        role: roleName.role_name,
        token: token,
        semesterAktif: KelasStudent[0]?.semester,
        tahunAjaranAktif: KelasStudent[0]?.ta_id,
      });
    }

    return res.status(200).json({
      status: "Success",
      msg: "Berhasil Login",
      user: user,
      role: roleName.role_name,
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

  console.log(payload);
  try {
    await userModel.create(payload);

    const user = await userModel.findOne({
      where: {
        email: email,
      },
      attributes: ["id", "name", "email"],
    });

    const userRole = await userRoleModel.create({
      user_id: user.id,
      role_id: 1,
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
        expiresIn: "360d",
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

async function registerWali(req, res) {
  const payload = req.body;
  const { email } = payload;

  payload.password = await bcrypt.hashSync(req.body.password, 10);

  try {
    const cek = await userModel.findOne({
      where: {
        email: email,
      },
      attributes: ["id", "name", "email"],
    });

    if (cek) {
      return res.status(422).json({
        status: "Gagal",
        msg: "Email sudah terdaftar",
      });
    }

    const user = await userModel.create(payload);

    const userRole = await userRoleModel.create({
      user_id: user.id,
      role_id: 8,
      status: "noactive",
    });

    const myRoles = await RolesModel.findByPk(userRole.id);

    const student = await StudentModel.findOne({
      where: {
        nisn: payload.nisn,
      },
    });

    if (student) {
      payload.nisn = student.nisn;
    }

    await ParentModel.create({
      user_id: user.id,
      nama_wali: payload.name,
      hubungan: payload.hubungan,
      no_hp: payload.no_hp,
      nisn: payload.nisn,
      nama_siswa: payload.nama_siswa,
    });

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
    });
  } catch (err) {
    console.log(err);
  }
}

async function nisnCek(req, res) {
  const payload = req.body;
  try {
    const nisn = await StudentModel.findOne({
      where: {
        nisn: payload.nisn,
      },
    });

    if (nisn) {
      return res.status(200).json({
        status: "Success",
        msg: "NISN Ditemukan",
        
      });
    } else {
      return res.status(422).json({
        status: "Warning",
        msg: "NISN tidak ada pada daftar siswa",
        
      });
    }
  } catch (err)  {
    console.log(err);
  }
}

async function authme(req, res) {
  let email = req.email;
  try {
    const token = JWT.sign(
      {
        email: req.email,
        name: req.name,
        id: req.id,
        role: req.role,
        roleId: req.Role_id,
        StudentId: req?.StudentId,
        student_id: req.student_id,
        teacher_id: req?.teacher_id,
        semesterAktif: req?.semesterAktif,
        tahunAjaranAktif: req?.tahunAjaranAktif,
        walsan_id : req?.walsan_id,
        allRole: req.allRole,
      },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      {
        expiresIn: "360d",
      }
    );

    if (req.role === "Wali Siswa") {
      return res.status(200).json({
        status: "Success",
        msg: "Berhasil Wali Santri Authme",
        user: {
          email: req.email,
          name: req.name,
          id: req.id,
          role: req.role,
          roleId: req.Role_id,
        },
        role: req.role,
        token: token,
        semesterAktif: req?.semesterAktif,
        tahunAjaranAktif: req?.tahunAjaranAktif,
      });
    }
    return res.status(200).json({
      status: "Success",
      msg: "Berhasil Authme",
      user: {
        email: req.email,
        name: req.name,
        id: req.id,
        role: req.role,
        roleId: req.Role_id,
      },
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
      expiresIn: "360d",
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
      expiresIn: "360d",
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

  if (!user) {
    return res.status(404).json({
      status: "fail",
      msg: "Email tidak ditemukan, Silahkan gunakan Email yang terdaftar",
    });
  }
  let token = crypto.randomBytes(32).toString("hex");

  const link = `${process.env.BASE_URL}/reset-password/${user.id}/${token}`;

  const context = {
    link: link,
  };
  const mail = await sendEmail(
    user.email,
    "Password Reset",
    "lupa_password",
    context
  );

  if (mail === "error") {
    return res.status(422).json({
      status: "Fail",
      msg: "Email tidak terkirim ",
    });
  }
  await TokenModel.create({
    userId: user.id,
    token: token,
  });
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
    return res.status(422).json({
      status: "fail",
      msg: "Token Sudah Expired",
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
  registerWali,
  nisnCek
};

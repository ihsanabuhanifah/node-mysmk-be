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
const {
  buildAccessPayload,
  signAccess,
  issueRefresh,
  rotateRefresh,
  revokeToken,
  revokeAllUser,
  userAman,
} = require("../utils/tokenService");
const {
  isAkunDiblokir,
  pesanAkunDiblokir,
} = require("../utils/statusAkun");

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

    if (isAkunDiblokir(user.status)) {
      return res.status(403).json({
        status: "fail",
        msg: pesanAkunDiblokir(user.status),
      });
    }

    loginAs = Number(loginAs);
    const roleName = await RolesModel.findByPk(loginAs);
    if (!roleName) {
      return res.status(422).json({ status: "Fail", msg: "Role login tidak valid" });
    }

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

    // Isi access token dibangun di satu tempat (dipakai juga saat refresh token)
    const { payload, extra } = await buildAccessPayload(user, loginAs);

    if (loginAs === 8 && !extra.parent?.student_id) {
      return res.status(422).json({
        status: "Fail",
        msg: `Akun dalam proses mapping antara Wali dan Siswa`,
      });
    }

    const token = signAccess(payload);
    const refreshToken = await issueRefresh(user.id, loginAs, req.headers["user-agent"]);

    return res.status(200).json({
      status: "Success",
      msg: "Berhasil Login",
      user: userAman(user),
      role: roleName.role_name,
      token: token,
      refreshToken: refreshToken,
      ...(loginAs === 8 && {
        semesterAktif: extra.KelasStudent?.[0]?.semester,
        tahunAjaranAktif: extra.KelasStudent?.[0]?.ta_id,
      }),
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

  if (isAkunDiblokir(users.status)) {
    return res.status(403).json({
      status: "fail",
      msg: pesanAkunDiblokir(users.status),
    });
  }

  const { payload } = await buildAccessPayload(users, null);
  const token = signAccess(payload);
  const refreshToken = await issueRefresh(users.id, null, req.headers["user-agent"]);

  return res.status(200).json({
    status: "Success",
    msg: "Berhasil Login",
    user: userAman(users),
    token: token,
    refreshToken: refreshToken,
  });
}

async function logout(req, res) {
  try {
    const refreshToken = req.body?.refreshToken || req.query?.refreshToken;
    if (refreshToken) await revokeToken(refreshToken, "logout");
  } catch (err) {
    console.log(err);
  }
  return res.clearCookie("refreshToken").status(200).json({
    status: "Success",
    message: "Anda telah berhasil logout",
  });
}

// POST /refresh-token  body: { refreshToken }
// Menukar refresh token dengan access token baru + refresh token baru (rotasi).
async function refreshAccessToken(req, res) {
  try {
    const hasil = await rotateRefresh(req.body?.refreshToken, req.headers["user-agent"]);
    if (!hasil.ok) {
      return res.status(hasil.code).json({ status: "fail", msg: hasil.msg });
    }
    const { payload } = await buildAccessPayload(hasil.user, hasil.loginAs);
    return res.json({
      status: "Success",
      token: signAccess(payload),
      refreshToken: hasil.refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
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

    // Ganti password -> cabut semua sesi (refresh token); perangkat ini login ulang
    await revokeAllUser(user.id, "password");
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

// ===== Lupa password dengan kode 6 karakter =====
const RESET_TOKEN_LENGTH = 6;
const RESET_TOKEN_EXPIRES_MINUTES = 15;
const RESET_TOKEN_MAX_ATTEMPTS = 5;
// Tanpa karakter yang mirip (0/O, 1/I/L) agar mudah diketik dari email
const RESET_TOKEN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
// Hitung salah input per user (in-memory); reset saat token baru dibuat / berhasil
const resetAttempts = new Map();

function generateResetToken() {
  let token = "";
  for (let i = 0; i < RESET_TOKEN_LENGTH; i++) {
    token += RESET_TOKEN_ALPHABET[crypto.randomInt(RESET_TOKEN_ALPHABET.length)];
  }
  return token;
}

function hashResetToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token).trim().toUpperCase())
    .digest("hex");
}

async function forgotPassword(req, res) {
  try {
    const email = String(req.body?.email || "").trim();
    if (!email) {
      return res.status(422).json({ status: "fail", msg: "Email wajib diisi" });
    }

    const user = await userModel.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        msg: "Email tidak ditemukan, Silahkan gunakan Email yang terdaftar",
      });
    }

    const token = generateResetToken();

    const mail = await sendEmail(
      user.email,
      `Kode Reset Password MySMK: ${token}`,
      "reset_password_token",
      {
        nama: user.name || user.email,
        token,
        menit: RESET_TOKEN_EXPIRES_MINUTES,
        tahun: new Date().getFullYear(),
      }
    );

    if (mail === "error") {
      return res.status(422).json({
        status: "Fail",
        msg: "Email tidak terkirim, silahkan coba lagi",
      });
    }

    // Hanya satu kode aktif per user
    await TokenModel.destroy({ where: { userId: user.id } });
    await TokenModel.create({ userId: user.id, token: hashResetToken(token) });
    resetAttempts.delete(user.id);

    return res.json({
      status: "Success",
      msg: `Kode reset password telah dikirim ke email Anda. Kode berlaku ${RESET_TOKEN_EXPIRES_MINUTES} menit.`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}

async function resetPasswordToken(req, res) {
  try {
    const email = String(req.body?.email || "").trim();
    const token = String(req.body?.token || "").trim().toUpperCase();
    const { newPassword } = req.body || {};

    if (!email || token.length !== RESET_TOKEN_LENGTH) {
      return res.status(422).json({
        status: "fail",
        msg: `Email dan kode ${RESET_TOKEN_LENGTH} karakter wajib diisi`,
      });
    }
    if (!newPassword || String(newPassword).length < 8) {
      return res.status(422).json({
        status: "fail",
        msg: "Password minimal 8 karakter",
      });
    }

    const invalid = () =>
      res.status(422).json({
        status: "fail",
        msg: "Kode salah atau sudah kedaluwarsa",
      });

    const user = await userModel.findOne({ where: { email } });
    if (!user) return invalid();

    const record = await TokenModel.findOne({
      where: { userId: user.id },
      order: [["id", "DESC"]],
    });
    if (!record) return invalid();

    const createdAt = new Date(record.createdAt).getTime();
    if (Date.now() - createdAt > RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000) {
      await TokenModel.destroy({ where: { userId: user.id } });
      resetAttempts.delete(user.id);
      return res.status(422).json({
        status: "fail",
        msg: "Kode sudah kedaluwarsa, silahkan minta kode baru",
      });
    }

    const expected = Buffer.from(record.token, "hex");
    const given = Buffer.from(hashResetToken(token), "hex");
    const match =
      expected.length === given.length && crypto.timingSafeEqual(expected, given);

    if (!match) {
      const attempts = (resetAttempts.get(user.id) || 0) + 1;
      if (attempts >= RESET_TOKEN_MAX_ATTEMPTS) {
        await TokenModel.destroy({ where: { userId: user.id } });
        resetAttempts.delete(user.id);
        return res.status(422).json({
          status: "fail",
          msg: "Terlalu banyak percobaan salah, silahkan minta kode baru",
        });
      }
      resetAttempts.set(user.id, attempts);
      return invalid();
    }

    await userModel.update(
      { password: bcrypt.hashSync(String(newPassword), 10) },
      { where: { id: user.id } }
    );
    await TokenModel.destroy({ where: { userId: user.id } });
    resetAttempts.delete(user.id);
    // Reset password -> semua sesi lama (refresh token) dicabut
    await revokeAllUser(user.id, "password");

    return res.status(201).json({
      status: "Success",
      msg: "Password berhasil di perbaharui",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: "fail", msg: "Terjadi Kesalahan" });
  }
}
module.exports = {
  login,
  logout,
  refreshAccessToken,
  register,
  authme,
  googleRegister,
  googleLogin,
  resetPassword,
  forgotPassword,
  resetPasswordToken,
  registerWali,
  nisnCek
};

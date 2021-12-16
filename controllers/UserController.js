const userModel = require("../models").User;
const userRoleModel = require("../models").UserRole;
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const { userAttribute } = require("../utils/attiributes");
const readXlsxFile = require("read-excel-file/node");
const fs = require("fs");
const path = require("path");

async function store(req, res) {
  const payload = req.body;
  payload.password = await bcrypt.hashSync(req.body.password, 10);

  try {
    const user = await userModel.create(payload);
    return res.status(201).json({
      status: "success",
      message: "Registrasi Berhasil",
      data: user,
    });
  } catch (err) {
    console.log(err);
  }
}

async function update(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }
  const payload = req.body;
  const { id } = req.params;
  const user = await userModel.findByPk(id);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User tidak ditemukan",
    });
  }
  const update = await userModel.update(payload, {
    where: {
      id: id,
    },
  });

  if (update) {
    return res.status(200).json({
      status: "success",
      message: "User berhasil di update",
    });
  } else {
    return res.status(422).json({
      status: "fail",
      message: "User tidak berhasil di update",
    });
  }
}

async function index(req, res) {
  const users = await userModel.findAll({
    attributes: userAttribute,
  });
  if (users) {
    return res.json({
      status: "success",
      message: "Daftar User ditemukan",
      data: users,
    });
  }
}

async function detail(req, res) {
  const { id } = req.params;
  const user = await userModel.findByPk(id, {
    attributes: userAttribute,
  });
  if (user) {
    return res.json({
      status: "success",
      message: "User Berhasil ditemukan",
      data: user,
    });
  } else {
    return res.status(404).json({
      status: "fail",
      message: "User Tidak Berhasil Ditemukan",
    });
  }
}

async function destroy(req, res) {
  const { id } = req.params;

  const deleteUser = await userModel.destroy({
    where: {
      id: id,
    },
  });

  if (deleteUser)
    return res.json({
      status: "success",
      message: "user berhasil di hapus",
    });

  return res.json({
    status: "fail",
    message: "user tidak ditemukan",
  });
}
async function importUser(req, res) {
  let password = process.env.IMPORT_PASSWORD;

  if (password !== req.body.password) {
    return res.status(400).json({
      msg: "Password Import Salah",
    });
  }
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;

    readXlsxFile(path).then(async (rows) => {
      // `rows` is an array of rows
      let users = [];
      let roles = [];
      rows.shift();
      rows.forEach(async (row) => {
        // let password = await bcrypt.hashSync(`${row[3]}`, 10);
        const user = {
          name: row[1],
          email: row[2],
          password: row[3],
          status: "active",
        };
        const role = {
          email: row[2],
          roles: row[5],
        };
        users.push(user);
        roles.push(role);
      });

      let count = 0;
      await Promise.all(
        users.map(async (user) => {
          const userMail = await userModel.findOne({
            where: {
              email: user.email,
            },
          });

          if (userMail === null) {
            user.password = await bcrypt.hashSync(user.password.toString(), 10);
            await userModel.create(user);
            count += 1;
          }
        })
      );

      roles.forEach(async (role) => {
        console.log(role.email);
        const user = await userModel.findOne({
          where: {
            email: role.email,
          },
        });

        if (user !== null) {
          const userRoles = `${role.roles}`.split(".");
          await Promise.all(
            userRoles.map(async (userRole) => {
              await userRoleModel.create({
                UserId: user.id,
                RoleId: userRole,
              });
            })
          );
        }
      });

      fs.unlinkSync(path);
      res.json({
        status: "Success",
        msg: " import users berhasil",
        successImport: count,
        failedImport: users.length - count,
      });
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "error",
    });
  }
}
module.exports = { store, index, detail, update, destroy, importUser };

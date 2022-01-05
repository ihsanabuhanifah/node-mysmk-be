const roleModel = require("../../models").Role;
const userModel = require("../../models").User;
const taModel = require("../../models").Ta;
const studentModel = require("../../models").Student;
const teacherModel = require("../../models").Teacher;
const parentModel = require("../../models").Parent;
const userRoleModel = require("../../models").UserRole;
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
async function importRoles(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let roles = [];

      rows.forEach((row) => {
        const role = {
          id: row[0],
          roleName: row[1],
          remarks: row[2],
        };
        roles.push(role);
      });

      fs.unlinkSync(path);
      console.log(roles);
      await Promise.all(
        roles.map(async (role) => {
          if (role.id !== null) {
            await roleModel.create(role);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Roles berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
async function importUsers(req, res) {
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
          name: row[1],
          email: row[2],
          roles: row[5],
          posisi : row[6],
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
        role.UserId = user.id
        if(role.posisi === 'guru') {
          await teacherModel.create(role);
        }
        if(role.posisi === 'wali') {
          await parentModel.create(role);
        }
        if(role.posisi === 'siswa') {
          await studentModel.create(role);
        }

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
    console.log(error);
    res.status(500).json({
      msg: "error",
    });
  }
}
async function importTa(req, res) {
  try {
    if (req.file == undefined) {
      return res.status(400).json({
        msg: "Upload File Excel",
      });
    }

    let password = process.env.IMPORT_PASSWORD;

    if (password !== req.body.password) {
      return res.status(400).json({
        msg: "Password Import Salah",
      });
    }
    let path = "public/data/uploads/" + req.file.filename;
    readXlsxFile(path).then(async (rows) => {
      rows.shift();
      let tas = [];

      rows.forEach((row) => {
        const ta = {
          id: row[0],
          name: row[1],
         
        };
        tas.push(ta);
      });

    

      fs.unlinkSync(path);
     
      await Promise.all(
        tas.map(async (ta) => {
          if (ta.id !== null) {
            await taModel.create(ta);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Tahun Ajaran berhasil",
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}
module.exports = { importRoles, importUsers, importTa};

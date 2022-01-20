const roleModel = require("../../models").role;
const userModel = require("../../models").user;
const taModel = require("../../models").ta;
const mapelModel = require("../../models").mapel;
const kelasModel = require("../../models").kelas;
const studentModel = require("../../models").student;
const teacherModel = require("../../models").teacher;
const parentModel = require("../../models").parent;
const userRoleModel = require("../../models").user_role;
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

async function importGuru(req, res) {
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
          roles: row[5],
          role: row[6],
        };
        const role = {
          name: row[1],
          email: row[2],
          roles: row[5],
          role: row[6],
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
            const userInTable = await userModel.findOne({
              where: {
                email: user.email,
              },
            });
            user.userId = userInTable.id;
            if (user.role === "guru") {
              user.namaGuru = user.name;
              await teacherModel.create(user);
            }

            if (userInTable !== null) {
              const userRoles = `${user.roles}`.split(".");
              await Promise.all(
                userRoles.map(async (userRole) => {
                  await userRoleModel.create({
                    userId: userInTable.id,
                    roleId: userRole,
                  });
                })
              );
            }

            count += 1;
          }
        })
      );

      fs.unlinkSync(path);
      res.json({
        status: "Success",
        msg: " import guru dan staf berhasil",
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
async function importSiswa(req, res) {
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
          roles: row[5],
          role: row[6],
          nis: row[7],
          nisn: row[8],
          nik: row[9],
          tempatLahir: row[10],
          tanggalLahir: row[11],
          alamat: row[12],
          sekolahAsal: row[13],
          jenisKelamin: row[14],
          anakKe: row[15],
          tanggalDiterima: row[16],
          angkatan: row[17],
          tahunAjaran: row[18],
        };
        const role = {
          name: row[1],
          email: row[2],
          roles: row[5],
          role: row[6],
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
            const userInTable = await userModel.findOne({
              where: {
                email: user.email,
              },
            });
            user.userId = userInTable.id;
            user.namaSiswa = user.name;

            if (user.role === "siswa") {
              await studentModel.create(user);
            }
            if (userInTable !== null) {
              const userRoles = `${user.roles}`.split(".");
              await Promise.all(
                userRoles.map(async (userRole) => {
                  await userRoleModel.create({
                    userId: userInTable.id,
                    roleId: userRole,
                  });
                })
              );
            }

            count += 1;
          }
        })
      );

      fs.unlinkSync(path);
      res.json({
        status: "Success",
        msg: " import santri berhasil",
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
async function importWali(req, res) {
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
          roles: row[5],
          role: row[6],
          nisn: row[7],
          hubungan: row[8],
        };
        const role = {
          name: row[1],
          email: row[2],
          roles: row[5],
          role: row[6],
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
            const student = await studentModel.findOne({
              where: {
                nisn: `${user.nisn}`,
              },
            });

            if (student !== null) {
              user.password = await bcrypt.hashSync(
                user.password.toString(),
                10
              );
              await userModel.create(user);
              const userInTable = await userModel.findOne({
                where: {
                  email: user.email,
                },
              });
              user.namaWali = userInTable?.name;
              user.userId = userInTable?.id;
              user.studentId = student?.id;

              await parentModel.create(user);

              if (userInTable !== null) {
                const userRoles = `${user.roles}`.split(".");
                await Promise.all(
                  userRoles.map(async (userRole) => {
                    await userRoleModel.create({
                      userId: userInTable.id,
                      roleId: userRole,
                    });
                  })
                );
              }
              count += 1;
            }
          }
        })
      );

      fs.unlinkSync(path);
      res.json({
        status: "Success",
        msg: " import wali santri berhasil",
        successImport: count,
        failedImport: users.length - count,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({
      msg: "error",
    });
  }
}

module.exports = {
  importGuru,
  importSiswa,
  importWali,
};

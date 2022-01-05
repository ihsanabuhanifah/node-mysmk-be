const roleModel = require("../../models").Role;
const userModel = require("../../models").User;
const taModel = require("../../models").Ta;
const mapelModel = require("../../models").Mapel;
const kelasModel = require("../../models").Kelas;
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
async function importMapel(req, res) {
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
      let mapels = [];

      rows.forEach((row) => {
        const mapel = {
          
          namaMapel: row[1],
          kategori: row[2],
        };
        mapels.push(mapel);
      });

      fs.unlinkSync(path);

      await Promise.all(
        mapels.map(async (mapel) => {
          if (mapel.id !== null) {
            await mapelModel.create(mapel);
          }
        })
      );
      res.json({
        status: "Success",
        msg: "import Mata Pelajaran berhasil",
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
async function importKelas(req, res) {
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
module.exports = {
  importRoles,
 
  importTa,
  importMapel,
  importKelas,
};

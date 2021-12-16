const roleModel = require("../../models").Role;
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
const dotenv = require("dotenv");
dotenv.config();
async function store(req, res) {
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
      await Promise.all(
        roles.map(async (role) => {
          await roleModel.create(role);
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

async function list(req, res) {
  try {
    const roles = await roleModel.findAll({
      attributes: ["id", "roleName"],
    });
    return res.json({
      status: "Success",
      roles: roles,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { store, list };

const roleModel = require("../../models").Role;
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
const dotenv = require("dotenv");
dotenv.config();
async function store(req, res) {
  if (req.file == undefined) {
    return res.status(400).json({
      msg: "Upload File Excel",
    });
  }

  let password = process.env.IMPORT_PASSWORD_USERS;

  if (password !== req.body.password) {
    return res.status(400).json({
      msg: "Password Import Salah",
    });
  }
  let path = "public/data/uploads/" + req.file.filename;
  readXlsxFile(path).then((rows) => {
    rows.shift();
    let roles = [];

    rows.forEach((row) => {
      const role = {
        id : row[0],
        roleName: row[1],
      };
      roles.push(role);
    });

    fs.unlinkSync(path);
    roles.map(async (role) => {
      await roleModel.create(role);
    });
    res.json({
      data: "Data berhasil di upload",
    });
  });
}

async function list(req, res) {
  try {
    const roles = await roleModel.findAll({
      attributes : ['id', 'roleName']
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

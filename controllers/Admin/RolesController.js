const roleModel = require("../../models").Role;
const fs = require("fs");
const readXlsxFile = require("read-excel-file/node");
async function store(req, res) {
  if (req.file == undefined) {
    return res.status(400).json({
      msg: "Upload File Excel",
    });
  }
  let path = "public/data/uploads/" + req.file.filename;
  readXlsxFile(path).then((rows) => {
    rows.shift();
    let roles = [];
    rows.forEach((row) => {
      const role = {
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

module.exports = { store };

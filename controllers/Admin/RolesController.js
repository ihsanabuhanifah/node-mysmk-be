const roleModel = require("../../models").Role;
const dotenv = require("dotenv");
dotenv.config();

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

module.exports = { list };

const roleModel = require("../../models").Role;
const UserRoleModel = require("../../models").user_role;
const models = require("../../models");
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

async function getRole(req, res) {
  try {
    const role = await UserRoleModel.findAll({
      where: {
        user_id: req.id,
       
      },
      attributes : ["id", "role_id"],
      include : [
        {
          model: models.role,
          require: true,
          as: "role",
          attributes: ["id", "role_name"],
        }
      ]
    });
    return res.json({
      status: "Success",
      role
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { list, getRole };

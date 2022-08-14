const roleModel = require("../../models").Role;
const UserRoleModel = require("../../models").user_role;
const UserModel = require("../../models").user;
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

async function saveToken(req, res) {
  try {
    const { token } = req.body;
    const getNotif = await UserModel.findOne({
      where: {
        id: req.id,
      },
    });

    if (getNotif.notif === null) {
      notif = [];
    } else {
      notif = JSON.parse(getNotif.notif);
    }

    let payload = {};
    if (notif.length === 0) {
      payload = {
        notif: JSON.stringify([token]),
      };
    } else if (notif.length === 1) {
      payload = {
        notif: JSON.stringify([...notif, token]),
      };
    } else if (notif.length === 2) {
      payload = {
        notif: JSON.stringify([notif[1], token]),
      };
    }

    await UserModel.update(payload, {
      where: {
        id: req.id,
      },
    });

    return res.json({
      status: "ok",
    });

  
  } catch (err) {
    console.log(err);
    res.status(403).json({
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
      attributes: ["id", "role_id"],
      include: [
        {
          model: models.role,
          require: true,
          as: "role",
          attributes: ["id", "role_name"],
        },
      ],
    });
    return res.json({
      status: "Success",
      role,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { list, getRole, saveToken };

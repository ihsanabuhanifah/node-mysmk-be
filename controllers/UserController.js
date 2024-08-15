const userModel = require("../models").user;
const userRoleModel = require("../models").user_role;
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const { userAttribute } = require("../utils/attiributes");


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
    include : 'userRole'
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

module.exports = { store, index, detail, update, destroy };

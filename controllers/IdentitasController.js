const UserModel = require("../models").User;
const LoginHistory = require("../models").LoginHistory;
const IdentitasModel = require("../models").Identitas;
const { userAttribute } = require("../utils/attiributes");
async function store(req, res) {
  try {
    const payload = req.body;
    payload.UserId = req.id;

    const save = await IdentitasModel.create(payload);
    res.send(save);
  } catch (err) {
    res.status(422).json({
      status: "fail",
      message: "Identitas dengan user ini sudah ada",
    });
  }
}
async function userDetail(req, res) {
  try {
    const user = await UserModel.findOne({
      where: {
        id: req.id,
      },
      attributes: userAttribute,
      include: ["identitas"],
    });

    return res.json({
      status: "Success",
      message: "Detail ditemukan",
      user: user,
    });
  } catch (err) {
    res.status(422).json({
      status: "fail",
      message: "Identitas dengan user ini sudah ada",
    });
  }
}
async function destroy(req, res) {
  try {
    const user = await IdentitasModel.destroy({
      where: {
        UserId: req.id,
      },
    });

    return res.json({
      status: "Success",
      message: "Detail ditemukan",
      user: user,
    });
  } catch (err) {
    res.status(422).json({
      status: "fail",
      message: "Identitas dengan user ini sudah ada",
    });
  }
}

async function update(req, res) {
  try {
    const payload = req.body;
    payload.UserId = req.id;
    
    const update = await IdentitasModel.update(payload, {
      where: {
        UserId: 12,
      },
    });
   if(update[0] === 0) return res.send('gagl')
     console.log(update)
    return res.status(200).json({
      status: "Success",
      message: "Identitas berhasil di update",
    });

    res.send(payload);
    res.send(save);
  } catch (err) {
    res.status(422).json({
      status: "fail",
      message: "Identitas tidak berhasil terupdate",
    });
  }
}
module.exports = { store, userDetail, destroy, update };

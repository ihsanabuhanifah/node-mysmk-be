const UserModel = require("../models").User;
const LoginHistory = require("../models").LoginHistory;

async function loginInfo(req, res) {
  try{
    const user = await UserModel.findAll({
        include: ["loginHistory"],
      })
      res.json({
        status: "success",
        data: user,
      });
  }
  catch (err) {
      console.log(err)
      res.send("ok")
  }
}
module.exports = { loginInfo };

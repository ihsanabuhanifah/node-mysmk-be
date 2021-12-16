const express = require("express");
const logRouter = express.Router();
const upload = require("../utils/multer");
const logController = require("../controllers/LogController")
const { check } = require("express-validator");
const userModel = require("../models").User;
const uplaod = require("../middleware/multerExcelMiddleware");

logRouter.get("/login", logController.loginInfo);
module.exports = logRouter;

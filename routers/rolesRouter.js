const express = require("express");
const rolesRouter = express.Router();


const { list } = require("../controllers/Admin/RolesController");


rolesRouter.get("/list", list);
module.exports = rolesRouter;

const express = require("express");
const rolesRouter = express.Router();
const uplaod = require("../middleware/multerExcelMiddleware");

const { store , list } = require("../controllers/Admin/RolesController");
const router = require(".");
rolesRouter.post("/import", uplaod.single("file"), store);
rolesRouter.get("/list" , list)
module.exports = rolesRouter;

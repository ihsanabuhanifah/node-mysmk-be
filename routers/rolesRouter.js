const express = require("express");
const rolesRouter = express.Router();
const uplaod = require("../middleware/multerExcelMiddleware");

const { store } = require("../controllers/Admin/RolesController");
rolesRouter.post("/import", uplaod.single("file"), store);
module.exports = rolesRouter;

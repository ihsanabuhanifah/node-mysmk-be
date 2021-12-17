const express = require("express");
const importRouter = express.Router();
const upload = require("../middleware/multerExcelMiddleware");
const {importRoles, importUsers} = require("../controllers/ExportImport/importController")

importRouter.post("/import/roles", upload.single("file"), importRoles);
importRouter.post("/import/users", upload.single("file"), importUsers);

module.exports = importRouter;

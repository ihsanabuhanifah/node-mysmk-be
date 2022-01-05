const express = require("express");
const importRouter = express.Router();
const upload = require("../middleware/multerExcelMiddleware");
const {
  importRoles,
  importUsers,
  importTa
} = require("../controllers/ExportImport/importController");

importRouter.post("/import/roles", upload.single("file"), importRoles);
importRouter.post("/import/users", upload.single("file"), importUsers);
importRouter.post("/import/ta", upload.single("file"), importTa);
module.exports = importRouter;

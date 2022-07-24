const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const authRouter = require("./authRouter");
const logRouter = require("./logRouters");
const identitasRouter = require("./indentitasRouter");
const rolesRouter = require("./rolesRouter");
const importRouter = require("./importRouter");
const guruRouter = require("./Guru");
const waliRouter = require("./Wali");
const daftarRouter = require("./Daftar");
const { formatHari } = require("../utils/format");
let moment = require("moment-timezone");
let date = moment().tz("Asia/Jakarta").format("hh:mm:ss");
let hari = formatHari(moment().tz("Asia/Jakarta").format());

const adminRouter = require("./Admin");
router.get("/", (req, res) => {
  res.send(`Backend MySMK di akses ${hari} jam ${date} `);
});
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");
const paginationMiddleware = require("../middleware/paginationMiddleware");

router.use(authRouter);
router.use(importRouter);
router.use(jwtValidateMiddleware);
router.use(paginationMiddleware);
router.use("/users", userRouter);
router.use("/info", logRouter);
router.use("/identitas", identitasRouter);
router.use("/admin/roles", rolesRouter);
router.use("/wali", waliRouter),
  router.use("/list", daftarRouter),
  router.use("/guru", guruRouter),
  router.use("/admin", adminRouter),
  (module.exports = router);

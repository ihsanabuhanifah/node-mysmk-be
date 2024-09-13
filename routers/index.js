const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const authRouter = require("./authRouter");
const logRouter = require("./logRouters");
const identitasRouter = require("./indentitasRouter");
const rolesRouter = require("./rolesRouter");
const importRouter = require("./importRouter");
const guruRouter = require("./Guru");
const guruRouterPkl = require("./Guru/fiturPkl");
const waliRouter = require("./Wali");
const santriRouter = require("./Santri");
const santriRouterPkl = require("./Santri/fiturPkl");
const ppdbRouter = require("./ppdb");
const daftarRouter = require("./Daftar");
const { hari, tanggal, jam } = require("../utils/tanggal");

const adminRouter = require("./Admin");
router.get("/", (req, res) => {
  res.send(
    `Backend MySMK di akses hari ${hari} tanggal ${tanggal} di jam ${jam}  `
  );
});
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");
const paginationMiddleware = require("../middleware/paginationMiddleware");

router.use(authRouter);
router.use(importRouter);
router.use(jwtValidateMiddleware);
router.use(paginationMiddleware);
router.use("/ppdb", ppdbRouter);
router.use("/users", userRouter);
router.use("/info", logRouter);
router.use("/identitas", identitasRouter);
router.use("/admin/roles", rolesRouter);
router.use("/santri", santriRouter);
router.use("/santri", santriRouterPkl);
router.use("/wali", waliRouter),
  router.use("/list", daftarRouter),
  router.use("/guru", guruRouter),
  router.use("/guru", guruRouterPkl),
  router.use("/admin", adminRouter),
  (module.exports = router);

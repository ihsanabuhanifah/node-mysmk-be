const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const authRouter = require("./authRouter");
const logRouter = require("./logRouters");
const identitasRouter = require("./indentitasRouter");
const rolesRouter = require("./rolesRouter");
const importRouter = require("./importRouter");
const waliRouter = require("./Wali")
router.get("/", (req, res) => {
  res.send("Backend MySMK");
});
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");
const paginationMiddleware = require("../middleware/paginationMiddleware")

router.use(authRouter);
router.use(importRouter);
router.use(jwtValidateMiddleware);
router.use(paginationMiddleware)
router.use("/users", userRouter);
router.use("/info", logRouter);
router.use("/identitas", identitasRouter);
router.use("/admin/roles", rolesRouter);
router.use("/wali" , waliRouter),
module.exports = router;

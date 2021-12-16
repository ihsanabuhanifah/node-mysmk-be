const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const authRouter = require("./authRouter");
const logRouter = require("./logRouters");
const identitasRouter = require("./indentitasRouter");
const rolesRouter = require("./rolesRouter");
router.get("/", (req, res) => {
  res.send("Backend MySMK");
});
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");

router.use(authRouter);
router.use(jwtValidateMiddleware);
router.use("/users", userRouter);
router.use("/info", logRouter);
router.use("/identitas", identitasRouter);
router.use("/admin/roles", rolesRouter);
module.exports = router;

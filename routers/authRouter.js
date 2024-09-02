const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/AuthController");
const validationMiddleware = require("../middleware/validationMiddleware");
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");
const { loginValidation, registerValidation } = require("../validator/auth");
const ppdbController = require("../controllers/ppdb/AuthController");

authRouter.post(
  "/login",
  loginValidation,
  validationMiddleware,
  authController.login
);
authRouter.post(
  "/login-ppdb",
  validationMiddleware,
  loginValidation,
  ppdbController.login
);
authRouter.post("/register-ppdb", registerValidation, ppdbController.register);

authRouter.post("/register", registerValidation, authController.register);

authRouter.post(
  "/register/wali",

  authController.registerWali
);
authRouter.post(
  "/nisn/cek",

  authController.nisnCek
);

authRouter.get("/authme", jwtValidateMiddleware, authController.authme);
authRouter.post("/google-register", authController.googleRegister);
authRouter.post("/google-login", authController.googleLogin);
authRouter.get("/logout", authController.logout);
authRouter.put(
  "/password/update",
  jwtValidateMiddleware,
  authController.resetPassword
);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post(
  "/reset-password/:UserId/:token",
  authController.resetPasswordEmail
);

module.exports = authRouter;

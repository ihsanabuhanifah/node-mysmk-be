const express = require("express");
const authRouter = express.Router();
const userModel = require("../models").User;
const { check } = require("express-validator");
const authController = require("../controllers/AuthController");
const validationMiddleware = require("../middleware/validationMiddleware");
const jwtValidateMiddleware = require("../middleware/jwtValidateMiddleware");


authRouter.post(
  "/login",
  check("email").isLength({ min: 8 }).withMessage("Nama wajib disi"),
  check("password").isLength({ min: 8 }).withMessage("Nama wajib disi"),

  authController.login
);

authRouter.post(
  "/register",
  check("name").isLength({ min: 1 }).withMessage("Nama wajib disi"),
 
  check("email")
    .isLength({ min: 1 })
    .withMessage("Nama wajib disi")
    .custom((value) => {
      return userModel.findOne({ where: { email: value } }).then((user) => {
        if (user) return Promise.reject("Email sudah digunakan");
      });
    }),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),
  check("passwordConfirmation")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        return Promise.reject("Password dan Password Konfirmasi tidak sama");

      // Indicates the success of this synchronous custom validator
      return true;
    }),
  validationMiddleware,
  authController.register
);

authRouter.get("/authme", jwtValidateMiddleware, authController.authme);
authRouter.post('/google-register' , authController.googleRegister)
authRouter.post('/google-login' , authController.googleLogin)
authRouter.get('/logout' , authController.logout)

module.exports = authRouter;

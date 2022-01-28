const userModel = require("../models").User;
const { check } = require("express-validator");

const loginValidation = [
  check("email").isEmail().withMessage("Masukan Email "),
  check("password").isLength({ min: 8 }).withMessage("Password minimal 8 karakter"),
];

const registerValidation = [
  check("name").isLength({ min: 1 }).withMessage("Nama wajib disi"),

  check("email")
    .isEmail()
    .withMessage("Masukan Email ")
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
];

module.exports = { loginValidation, registerValidation };

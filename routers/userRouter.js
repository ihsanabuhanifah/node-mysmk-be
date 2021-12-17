const express = require("express");
const userRouter = express.Router();

const userController = require("../controllers/UserController");
const { check } = require("express-validator");
const userModel = require("../models").User;


userRouter.post(
  "/",
  check("name").isLength({ min: 1 }).withMessage("Nama wajib disi"),
  check("username").custom((value) => {
    return userModel.findOne({ where: { username: value } }).then((user) => {
      if (user) {
        return Promise.reject("Username sudah digunakan");
      }
    });
  }),
  check("email").custom((value) => {
    return userModel.findOne({ where: { email: value } }).then((user) => {
      if (user) {
        return Promise.reject("Email sudah digunakan");
      }
    });
  }),
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter"),
  check("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      return Promise.reject("Password dan Password Konfirmasi tidak sama");
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),

  userController.store
);
userRouter.put("/:id/update", userController.update);
userRouter.get("/", userController.index);
userRouter.get("/:id/detail", userController.detail);
userRouter.delete("/:id/delete", userController.destroy);

module.exports = userRouter;

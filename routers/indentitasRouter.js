const express = require("express");
const identitasRouter = express.Router();
const upload = require("../utils/multer");
const {store, userDetail, destroy, update} = require("../controllers/IdentitasController");

const userModel = require("../models").User;
const { check } = require("express-validator");
const validationMiddleware = require("../middleware/validationMiddleware");
identitasRouter.post(
  "/",
  check("tempatLahir").isLength({ min: 1 }).withMessage("Nama wajib disi"),
  check("tanggalLahir").isLength({ min: 1 }).withMessage("Nama wajib disi"),
  check("jenisKelamin").isLength({ min: 1 }).withMessage("Nama wajib disi"),
  check("alamat").isLength({ min: 1 }).withMessage("Nama wajib disi"),
  validationMiddleware,
 store
);

identitasRouter.get("/user" , userDetail )

identitasRouter.delete("/delete" , destroy )
identitasRouter.put(
    "/update",
    check("tempatLahir").isLength({ min: 1 }).withMessage("Nama wajib disi"),
    check("tanggalLahir").isLength({ min: 1 }).withMessage("Nama wajib disi"),
    check("jenisKelamin").isLength({ min: 1 }).withMessage("Nama wajib disi"),
    check("alamat").isLength({ min: 1 }).withMessage("Nama wajib disi"),
    validationMiddleware,
   update
  );
module.exports = identitasRouter;

const express = require("express");


const ppdb = express.Router()

const {
  login,register
} = require('../../controllers/ppdb/AuthController');
const { registerValidation } = require("../../validator/auth");

ppdb.post('/login', login);
ppdb.post('/register', registerValidation,register);

module.exports = ppdb;


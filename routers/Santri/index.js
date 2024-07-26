const express = require("express");
const santriAccessMiddleware = require("../../middleware/santriAccessMiddleware");

const santri = express.Router();
const { profile } = require('../../controllers/Santri/ProfileController')

santri.use(santriAccessMiddleware);
santri.get('/profile', profile);

module.exports = santri;


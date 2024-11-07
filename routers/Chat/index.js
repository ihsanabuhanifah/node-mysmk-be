const express = require('express');
const chat = express.Router();

const { listChat } = require('../../controllers/Chat/ChatController');

chat.get("/list", listChat)

module.exports = chat
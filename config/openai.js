

const { OpenAI } = require("openai");
const dotenv = require("dotenv");


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


module.exports = openai;
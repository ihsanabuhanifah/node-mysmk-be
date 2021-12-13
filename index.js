const express = require("express");
const app = express();
const router = require("./routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = process.env.APP_PORT || 6000;
const key = process.env.KEY;
const morgan = require('morgan')
require("dotenv").config();

 
  


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan(':user-agent'))
app.use(router);
console.log(key);
app.listen(process.env.APP_PORT ,() => {
  console.log(`Server berjalan di port ${port}`);
});

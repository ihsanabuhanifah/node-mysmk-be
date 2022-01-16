const express = require("express");
const app = express();
const router = require("./routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 8000;
const key = process.env.KEY;
const morgan = require("morgan");
const { sequelize } = require("./models");


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan(":user-agent"));
app.use(router);
console.log(key);
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});

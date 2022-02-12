const express = require("express");
const app = express();
const router = require("./routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 8000;

const { sequelize } = require("./models");
const cron = require("node-cron");
const { schedule } = require("./controllers/Admin/jadwalController");

// const rule = new schedule2.RecurrenceRule();
// rule.minute = 1;
// console.log(rule.minute);
const job = cron.schedule("0 18 * * *", schedule);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(router);

job.start();
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connection has been established successfully ${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});

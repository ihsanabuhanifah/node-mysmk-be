const express = require("express");
const app = express();
const router = require("./routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 8000;
const dayjs = require("dayjs");

const { sequelize } = require("./models");
const cron = require("node-cron");
const {
  scheduleKelas,
  scheduleHalaqoh,
} = require("./controllers/Admin/jadwalController");

const date = new Date();

console.log(dayjs(date).format("hh:mm:ss"));
const job = cron.schedule("5 18 * * *", scheduleKelas);
const halaqoh = cron.schedule("20 18 * * *", scheduleHalaqoh);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(router);

job.start();
halaqoh.start();
app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connection has been established successfully ${port}`);
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});

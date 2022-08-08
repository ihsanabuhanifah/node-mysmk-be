const express = require("express");
const app = express();
const router = require("./routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 8000;
cors
var moment = require("moment-timezone");
let date = moment().tz("Asia/Jakarta").format("hh:mm:ss");

const { sequelize } = require("./models");
const cron = require("node-cron");
const {
  scheduleKelas,
  scheduleHalaqoh,
} = require("./controllers/Admin/jadwalController");



console.log(date);
const job = cron.schedule("01 00 * * *", scheduleKelas);
const halaqoh = cron.schedule("02 00 * * *", scheduleHalaqoh);
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
    console.error("Koneksi ke database gaagal");
  }
});

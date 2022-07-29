let moment = require("moment-timezone");
const { formatHari } = require("./format");
let jam = moment().tz("Asia/Jakarta").format("hh:mm:ss");
let hari = formatHari(moment().tz("Asia/Jakarta").format("YYYY-MM-DD"));
let tanggal = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");

module.exports = { jam, hari, tanggal };

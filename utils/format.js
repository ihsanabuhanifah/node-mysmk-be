const dayjs = require("dayjs");
function formatHari(timeStamps) {
  let hari = dayjs(timeStamps).format("dddd");

  if (hari === "Monday") return (hari = "Senin");

  if (hari === "Tuesday") {
    return (hari = "Selasa");
  }
  if (hari === "Wednesday") {
    return (hari = "Rabu");
  }
  if (hari === "Thursday") {
    return (hari = "Kamis");
  }
  if (hari === "Friday") {
    return (hari = "Jumat");
  }
  if (hari === "Saturday") {
    return (hari = "Sabtu");
  }
  if (hari === "Sunday") {
    return (hari = "Minggu");
  }
}
function formatDate(timeStamps) {
  let hari = dayjs(timeStamps).format("dddd");

  if (hari === "Monday") {
    hari = "Senin";
  }
  if (hari === "Tuesday") {
    hari = "Selasa";
  }
  if (hari === "Wednesday") {
    hari = "Rabu";
  }
  if (hari === "Thursday") {
    hari = "Kamis";
  }
  if (hari === "Friday") {
    hari = "Jumat";
  }
  if (hari === "Saturday") {
    hari = "Sabtu";
  }
  if (hari === "Sunday") {
    hari = "Minggu";
  }

  let bulan = dayjs(timeStamps).format("MM");
  if (bulan === "01") {
    bulan = "Januari";
  }
  if (bulan === "02") {
    bulan = "Februari";
  }
  if (bulan === "03") {
    bulan = "Maret";
  }
  if (bulan === "04") {
    bulan = "April";
  }
  if (bulan === "05") {
    bulan = "Mei";
  }
  if (bulan === "06") {
    bulan = "Juni";
  }
  if (bulan === "07") {
    bulan = "Juli";
  }
  if (bulan === "08") {
    bulan = "Agustus";
  }
  if (bulan === "09") {
    bulan = "September";
  }
  if (bulan === "10") {
    bulan = "Oktober";
  }
  if (bulan === "11") {
    bulan = "November";
  }
  if (bulan === "12") {
    bulan = "Desember";
  }

  return `${hari}, ${dayjs(timeStamps).format("DD")} ${bulan} ${dayjs(
    timeStamps
  ).format("YYYY")} `;
}

function checkQuery(value) {
  if (value === undefined) return false;

  if (value === "") return false;
  console.log("mauk aini", value);
  if (value === null) return false;
  return true;
}

const calculateMinutesDifference = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Hitung perbedaan dalam milidetik
  const differenceInMilliseconds = end - start;

  // Konversi milidetik ke menit
  const differenceInMinutes = Math.floor(differenceInMilliseconds / 1000 / 60);

  return differenceInMinutes;
};

const calculateWaktuSelesai = (durasi) => {
  const now = new Date();
  const futureTime = new Date(now.getTime() + durasi * 60 * 1000);
  return futureTime;
};

module.exports = {
  formatDate,
  formatHari,
  checkQuery,
  calculateMinutesDifference,
  calculateWaktuSelesai,
};

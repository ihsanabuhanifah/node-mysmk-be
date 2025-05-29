const messagesModel = require("./models").messages;
const express = require("express");
const app = express();
const router = require("./routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
var path = require("path");
require("dotenv").config();
const port = process.env.PORT || 8000;

const http = require("http");
const { Server } = require("socket.io");

var moment = require("moment-timezone");
let date = moment().tz("Asia/Jakarta").format("hh:mm:ss");

const { sequelize } = require("./models");
const cron = require("node-cron");

const {
  scheduleKelas,
  scheduleHalaqoh,
} = require("./controllers/Admin/jadwalController");
const {
  createKehadiran,
} = require("./controllers/Guru/KehadiranGuruController");
const {
  createPembayaran,
  createNotification,
} = require("./controllers/Wali/PembayaranController");

const job = cron.schedule("06 00 * * *", scheduleKelas);
const kehadiran_guru = cron.schedule("05 00 * * *", createKehadiran);
const halaqoh = cron.schedule("02 00 * * *", scheduleHalaqoh);
const notifikasi = cron.schedule("00 00 05 * *", createNotification);

app.use(cors());
app.use(express.json());
app.use(express.static("public/data/uploads"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(router);

// socket io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let connectedUser = [];
let clients = [];

// server.js (Socket.IO bagian join room)
// server.js

// Simpan di level server (bukan per socket)
const roomMembers = new Map();
const catatanUjian = []


const resetCatatanUjian = () => {
  catatanUjian.length = 0; // Mengosongkan array
  console.log('Catatan ujian telah direset pada', new Date().toISOString());
};

const resetCatatan = cron.schedule('0 0 * * *', resetCatatanUjian, {
  timezone: 'Asia/Jakarta' // Sesuaikan timezone
});




io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, user }, callback) => {
    try {
      // Validasi
      if (!roomId || !user?.id) throw new Error("Room ID and user ID required");

      // Join room
      socket.join(roomId);

      // Inisialisasi room jika belum ada
      if (!roomMembers[roomId]) {
        roomMembers[roomId] = new Map(); // Gunakan Map untuk simpan user data
      }

      // Tambahkan user ke room
      roomMembers[roomId].set(user.id, {
        id: user.id,
        name: user.name,
        socketId: socket.id,
        role: user.role,
        joinedAt: new Date().toISOString(),
      });

      // Kirim update ke semua anggota room
      io.to(roomId).emit("room-update", {
        type: "user-joined",
        roomId,
        user,
        members: Array.from(roomMembers[roomId].values()), // Konversi Map ke Array
      });

      callback({
        success: true,
        members: Array.from(roomMembers[roomId].values()),
      });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on("get-members", (roomId, callback) => {
    const members = roomMembers[roomId]
      ? Array.from(roomMembers[roomId].values())
      : [];
    callback({ success: true, members });
  });
  // Handle leave/disconnect
  socket.on("leave-room", ({ roomId, userId }) => {
    if (roomMembers[roomId]?.has(userId)) {
      roomMembers[roomId].delete(userId);
      io.to(roomId).emit("room-update", {
        type: "user-left",
        roomId,
        userId,
        members: Array.from(roomMembers[roomId].values()),
      });
    }
  });

  socket.on("disconnect", () => {
    // Cari semua room yang mengandung socket ini dan hapus
    Object.entries(roomMembers).forEach(([roomId, members]) => {
      if ([...members.values()].some((u) => u.socketId === socket.id)) {
        const userToRemove = [...members.values()].find(
          (u) => u.socketId === socket.id
        );
        members.delete(userToRemove.id);
        io.to(roomId).emit("room-update", {
          type: "user-left",
          roomId,
          userId: userToRemove.id,
          members: Array.from(members.values()),
        });
      }
    });
  });

  socket.on("simpan", ({ data }, callback) => {
    try {
      // Validasi
      if (!data || typeof data !== "object") {
        throw new Error("Data harus berupa object");
      }

      // Kirim balasan ke pengirim saja
      callback({ success: true });

      // Broadcast ke semua client LAIN (kecuali pengirim)
      socket.broadcast.emit("simpan.reply", { data });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on("get-catatan", (roomId, callback) => {
  
    callback({ success: true, catatanUjian });
  });


socket.on("catatan", ({ message, roomId }, callback) => {
    try {
      // Validasi
    
      console.log("message", message);
      console.log("roomId", roomId);
       console.log("catatanUjian", catatanUjian);

      catatanUjian.unshift(message)

      // Kirim balasan ke pengirim saja
      // callback({ success: true });

     

      // Broadcast ke semua client LAIN (kecuali pengirim)
      socket.to(roomId).emit("catatan.reply", { catatanUjian });
    } catch (error) {
      // callback({ success: false, error: error.message });
    }
  });

});

// Periodic cleanup (setiap 1 menit)
setInterval(() => {
  const now = Date.now();
  roomMembers.forEach((users, roomId) => {
    users.forEach((user, userId) => {
      // Jika user tidak aktif > 2 menit, anggap disconnected
      if (now - user.lastActive > 120000) {
        users.delete(userId);
        io.to(roomId).emit("room-update", {
          type: "user-timeout",
          roomId,
          userId,
          members: Array.from(users.values()),
        });
      }
    });
  });
}, 60000);

resetCatatan.start();
job.start();
kehadiran_guru.start();
halaqoh.start();
notifikasi.start();

server.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connection has been established successfully ${port}`);
  } catch (error) {
    console.error("Koneksi ke database gagal");
  }
});

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

// Simpan di level server (bukan per socket)
const roomMembers = new Map();
const catatanUjian = [];
const pesanchat = [];

const resetCatatanUjian = () => {
  catatanUjian.length = 0; // Mengosongkan array
  console.log("Catatan ujian telah direset pada", new Date().toISOString());
};

const resetCatatan = cron.schedule("0 0 * * *", resetCatatanUjian, {
  timezone: "Asia/Jakarta", // Sesuaikan timezone
});

io.on("connection", (socket) => {
  // Set lastActive when user first connects
  socket.lastActive = Date.now();

  socket.on("join-room", ({ roomId, user }, callback) => {
    try {
      // Validasi
      if (!roomId || !user?.id) throw new Error("Room ID and user ID required");

      // Join room
      socket.join(roomId);

      // Inisialisasi room jika belum ada
      if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Map());
      }

      const room = roomMembers.get(roomId);
      
      // Tambahkan user ke room dengan lastActive
      room.set(user.id, {
        id: user.id,
        name: user.name,
        socketId: socket.id,
        role: user.role,
        joinedAt: new Date().toISOString(),
        lastActive: Date.now() // Tambahkan timestamp aktif terakhir
      });

      // Kirim update ke semua anggota room
      io.to(roomId).emit("room-update", {
        type: "user-joined",
        roomId,
        user,
        members: Array.from(room.values()),
      });

      callback({
        success: true,
        members: Array.from(room.values()),
      });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  // Handler untuk update lastActive ketika user melakukan aktivitas
  socket.on("user-activity", ({ roomId, userId }) => {
    if (roomId && userId && roomMembers.has(roomId)) {
      const room = roomMembers.get(roomId);
      if (room.has(userId)) {
        const user = room.get(userId);
        user.lastActive = Date.now();
        room.set(userId, user);
      }
    }
  });

  socket.on("get-members", (roomId, callback) => {
    const members = roomMembers.has(roomId)
      ? Array.from(roomMembers.get(roomId).values())
      : [];
    callback({ success: true, members });
  });

  // Handle leave/disconnect
  socket.on("leave-room", ({ roomId, userId }) => {
    if (roomMembers.has(roomId) && roomMembers.get(roomId).has(userId)) {
      roomMembers.get(roomId).delete(userId);
      io.to(roomId).emit("room-update", {
        type: "user-left",
        roomId,
        userId,
        members: Array.from(roomMembers.get(roomId).values()),
      });
    }
  });

  socket.on("disconnect", () => {
    // Cari semua room yang mengandung socket ini dan hapus
    roomMembers.forEach((members, roomId) => {
      members.forEach((user, userId) => {
        if (user.socketId === socket.id) {
          members.delete(userId);
          io.to(roomId).emit("room-update", {
            type: "user-left",
            roomId,
            userId: user.id,
            members: Array.from(members.values()),
          });
        }
      });
    });
  });

  socket.on("kirim-pesan", ({ data }, callback) => {
    try {
      // Update lastActive
      if (data.roomId && data.senderId && roomMembers.has(data.roomId)) {
        const room = roomMembers.get(data.roomId);
        if (room.has(data.senderId)) {
          const user = room.get(data.senderId);
          user.lastActive = Date.now();
          room.set(data.senderId, user);
        }
      }

      pesanchat.unshift(data);
      callback({ success: true });
      socket.broadcast.emit("kirim-pesan.reply", data);
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on("get-catatan", (roomId, callback) => {
    callback({ success: true, catatanUjian });
  });

  socket.on("catatan", ({ message, id, userId, roomId }, callback) => {
    try {
      // Update lastActive
      if (roomId && userId && roomMembers.has(roomId)) {
        const room = roomMembers.get(roomId);
        if (room.has(userId)) {
          const user = room.get(userId);
          user.lastActive = Date.now();
          room.set(userId, user);
        }
      }

      catatanUjian.unshift({
        message: message,
        id: id,
        userId: userId,
      });

      socket.to(roomId).emit("catatan.reply", { catatanUjian });
    } catch (error) {
      console.error("Error in catatan handler:", error);
    }
  });
});

// Periodic cleanup (setiap 30 detik untuk mengecek user yang tidak aktif)
const inactiveCheckInterval = setInterval(() => {
  const now = Date.now();
  const inactiveTime = 60000; // 1 menit dalam milidetik

  roomMembers.forEach((members, roomId) => {
    members.forEach((user, userId) => {
      // Jika user tidak aktif > 1 menit, anggap disconnected
      if (now - user.lastActive > inactiveTime) {
        members.delete(userId);
        
        // Dapatkan socket yang terkait dengan user ini
        const userSocket = io.sockets.sockets.get(user.socketId);
        
        // Jika socket masih ada, keluarkan dari room
        if (userSocket) {
          userSocket.leave(roomId);
        }

        io.to(roomId).emit("room-update", {
          type: "user-timeout",
          roomId,
          userId,
          members: Array.from(members.values()),
          message: `${user.name} telah keluar karena tidak aktif`
        });
      }
    });
  });
}, 30000); // Cek setiap 30 detik

// Cleanup interval ketika server dimatikan
server.on("close", () => {
  clearInterval(inactiveCheckInterval);
});

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
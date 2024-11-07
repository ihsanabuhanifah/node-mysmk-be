const messagesModel = require('./models').messages
const express = require('express')
const app = express()
const router = require('./routers')
const cors = require('cors')
const cookieParser = require('cookie-parser')
var path = require('path')
require('dotenv').config()
const port = process.env.PORT || 8000

const http = require('http')
const { Server } = require('socket.io')

var moment = require('moment-timezone')
let date = moment().tz('Asia/Jakarta').format('hh:mm:ss')

const { sequelize } = require('./models')
const cron = require('node-cron')

const { scheduleKelas, scheduleHalaqoh } = require('./controllers/Admin/jadwalController')
const { createKehadiran } = require('./controllers/Guru/KehadiranGuruController')
const { createPembayaran, createNotification } = require('./controllers/Wali/PembayaranController')

const job = cron.schedule('06 00 * * *', scheduleKelas)
const kehadiran_guru = cron.schedule('05 00 * * *', createKehadiran)
const halaqoh = cron.schedule('02 00 * * *', scheduleHalaqoh)
const notifikasi = cron.schedule('00 00 05 * *', createNotification)

app.use(cors())
app.use(express.json())
app.use(express.static('public/data/uploads'))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(router)

// socket io
const server = http.createServer(app)

const io = new Server(server, {
	cors: {
		origin: 'http://localhost:2001',
	},
})

let connectedUser = []
let clients = []

io.on('connection', (socket) => {
	const user = {
		idDB: socket.handshake.query.idDB,
		roleDB: socket.handshake.query.roleDB,
	}
	connectedUser.push(user)
	socket.user = user
	clients.push(socket)

	socket.on('message', async (msg) => {
		console.log('message from client:', msg)

		const isExistMsg = await messagesModel.findOne({
			where: {
				student_id: msg.student_id,
				teacher_id: msg.teacher_id
			}
		})

		if(!isExistMsg) {
			let msgData = JSON.stringify([msg])
			await messagesModel.create({
				teacher_id: msg.teacher_id,
				student_id: msg.student_id,
				message: msgData
			})
		} else {
			let prevMsg = JSON.parse(isExistMsg.message)
			let newMsgData = [...prevMsg, msg]
			console.log('nih', newMsgData)
			await isExistMsg.update({
				message: JSON.stringify(newMsgData)
			})
		}

		console.log('nnih makan', isExistMsg)

		if (msg.teacher_id && msg.role == 'siswa') {
			for (let i = 0; i < clients.length; i++) {
				if (clients[i].user.idDB == msg.teacher_id && clients[i].user.roleDB == 'guru') {
					clients[i].emit('message', {
						student_id: socket.user.idDB,
						role: socket.user.roleDB,
						text: msg.text,
						id: Date.now(),
						teacher_id: msg.teacher_id,
					})
				}
			}
		}
		if (msg.student_id && msg.role == 'guru') {
			for (let i = 0; i < clients.length; i++) {				
				if (clients[i].user.idDB == msg.student_id && clients[i].user.roleDB == 'siswa') {
					clients[i].emit('message', {
						teacher_id: socket.user.idDB,
						role: socket.user.roleDB,
						text: msg.text,
						id: Date.now(),
						student_id: msg.student_id,
					})
				}
			}
		}
	})

	socket.on('disconnect', () => {
		const user = {
			socketID: socket,
			idDB: socket.handshake.query.idDB,
		}
		const userUpdate = connectedUser.filter((item) => item.idDB != user.idDB)
		connectedUser = userUpdate
	})
})

job.start()
kehadiran_guru.start()
halaqoh.start()
notifikasi.start()

server.listen(port, async () => {
	try {
		await sequelize.authenticate()
		console.log(`Connection has been established successfully ${port}`)
	} catch (error) {
		console.error('Koneksi ke database gagal')
	}
})

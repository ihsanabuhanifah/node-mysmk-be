const { Op } = require('sequelize')
const { RESPONSE_API } = require('../../utils/response')
const KehadiranSholats = require('../../models').kehadiransholat
const response = new RESPONSE_API()
const { format } = require('date-fns')
const { checkQuery } = require('../../utils/format')

const cekWaktuSholat = response.requestResponse(async (req, res) => {
	const { waktu } = req.params
	console.log(waktu)
	const dateNow = new Date()
	const startOfDay = new Date(dateNow.setHours(0, 0, 0, 0))
	const endOfDay = new Date(dateNow.setHours(23, 59, 59, 999))

	const waktuSholat = await KehadiranSholats.findOne({
		where: {
			created_at: {
				[Op.between]: [startOfDay, endOfDay],
			},
			waktu: {
				[Op.substring]: waktu,
			},
		},
	})

	if (waktuSholat) {
		return {
			data: waktuSholat,
		}
	}

	return {
		data: false,
	}
})

const createWaktuSholat = response.requestResponse(async (req, res) => {
	const { waktu, text } = req.body
	const dateNow = new Date()
	const startOfDay = new Date(dateNow.setHours(0, 0, 0, 0))
	const endOfDay = new Date(dateNow.setHours(23, 59, 59, 999))

	const kehadiran = await KehadiranSholats.findOne({
		where: {
			created_at: {
				[Op.between]: [startOfDay, endOfDay],
			},
			waktu: {
				[Op.substring]: waktu,
			},
		},
	})

	if (!kehadiran) {
		await KehadiranSholats.create({ waktu, kehadiran: text })
	}

	await KehadiranSholats.update(
		{ kehadiran: text },
		{
			where: {
				created_at: {
					[Op.between]: [startOfDay, endOfDay],
				},
				waktu: {
					[Op.substring]: waktu,
				},
			},
		}
	)

	return {
		msg: 'Berhsail',
	}
})

const listWaktuSholat = response.requestResponse(async (req, res) => {
	const { tanggal, waktu } = req.query

	let startOfDay
	let endOfDay

	if (tanggal == 'now' || tanggal == null || tanggal == '') {
		const dateNow = new Date()
		startOfDay = new Date(dateNow.setHours(0, 0, 0, 0))
		endOfDay = new Date(dateNow.setHours(23, 59, 59, 999))
	} else {
		const date = new Date(tanggal)
		startOfDay = new Date(date.setHours(0, 0, 0, 0))
		endOfDay = new Date(date.setHours(23, 59, 59, 999))
	}

	const result = await KehadiranSholats.findOne({
		where: {
			createdAt: {
				[Op.between]: [startOfDay, endOfDay],
			},
			...(checkQuery(waktu) && {
				waktu: {
					[Op.substring]: waktu,
				},
			}),
		},
	})

	return {
		msg: 'Data Berhasil Ditemuka',
		data: result,
	}
})

module.exports = {
	createWaktuSholat,
	cekWaktuSholat,
	listWaktuSholat,
}

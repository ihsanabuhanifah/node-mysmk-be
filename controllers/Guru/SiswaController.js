const KelasStudentModel = require('../../models').kelas_student
const StudentModel = require('../../models').student
const models = require('../../models')
const { Op, where } = require('sequelize')
const UserModel = require('../../models').user
const { checkQuery } = require('../../utils/format')
const excel = require('exceljs')
const { RESPONSE_API } = require('../../utils/response')
const response = new RESPONSE_API()

const mapelModel = require('../../models').mapel
const nilaiModel = require('../../models').nilai
const hasilBelajarModel = require('../../models').hasil_belajar
const ujianModel = require('../../models').ujian

async function listSiswa(req, res) {
	let { nama_kelas, nama_siswa, keyword, tahun_ajaran, status, page, pageSize } = req.query
	try {
		const siswa = await KelasStudentModel.findAndCountAll({
			where: {
				...(checkQuery(status) && {
					status: status,
				}),
			},
			limit: pageSize,
			offset: page,
			include: [
				{
					model: models.kelas,
					require: true,
					as: 'kelas',
					attributes: ['id', 'nama_kelas'],
					where: {
						...(checkQuery(nama_kelas) && {
							nama_kelas: {
								[Op.substring]: nama_kelas,
							},
						}),
					},
				},
				{
					model: models.student,
					require: true,
					as: 'siswa',
					//   attributes: ["id", "nama_siswa"],
					where: {
						...(checkQuery(nama_siswa) && {
							nama_siswa: {
								[Op.substring]: nama_siswa,
							},
						}),
						...(checkQuery(keyword) && {
							nama_siswa: {
								[Op.substring]: keyword,
							},
						}),
					},
				},

				{
					model: models.ta,
					require: true,
					as: 'tahun_ajaran',
					attributes: ['id', 'nama_tahun_ajaran'],

					where: {
						...(checkQuery(tahun_ajaran) && {
							nama_tahun_ajaran: {
								[Op.substring]: tahun_ajaran,
							},
						}),
					},
				},
			],
		})

		return res.json({
			status: 'Success',
			msg: 'Daftar Siswa ditemukan',
			page: req.page,
			pageSize: pageSize,
			data: siswa,
		})
	} catch (err) {
		console.log(err)
		return res.status(403).json({
			status: 'Fail',
			msg: 'Terjadi Kesalahan',
		})
	}
}

async function createSiswaKelas(req, res) {
	let { data } = req.body
	try {
		await KelasStudentModel.bulkCreate(data)
		return res.json({
			status: 'Success',
			msg: 'Jadwal Berhasil ditambahkan',
		})
	} catch (err) {
		console.log(err)
		return res.status(403).json({
			status: 'Fail',
			msg: 'Terjadi Kesalahan',
		})
	}
}

const deleteSiswaKelas = async (req, res) => {
	try {
		const { id } = req.params
		await KelasStudentModel.destroy({
			where: {
				id: id,
			},
		})

		return res.json({
			status: 'Success',
			msg: `data berhasil terhapus`,
		})
	} catch (err) {
		console.log(err)
		return res.status(403).json({
			status: 'Fail',
			msg: 'Terjadi Kesalahan',
		})
	}
}

const detailSiswa = response.requestResponse(async (req, res) => {
	const { id } = req.params
	const siswa = await StudentModel.findOne({
		where: {
			id,
		},

		include: [
			{
				model: models.user,
				require: true,
				as: 'user',
				attributes: ['email'],
			},
		],
	})

	if (!siswa) {
		return {
			statusCode: 422,
			msg: 'Siswa tidak ditemukan',
		}
	}

	return {
		msg: 'Berhasil',
		siswa,
	}
})

const updateSiswa = response.requestResponse(async (req, res) => {
	const { id } = req.params

	const { nama_siswa, nis, nisn, nik, tempat_lahir, tanggal_lahir, alamat, sekolah_asal, anak_ke, status, angkatan, tahub_ajaran, keterangan, user_id, email } = req.body

	await UserModel.update(
		{
			name: nama_siswa,
			email: email,
		},
		{
			where: {
				id: user_id,
			},
		}
	)

	await StudentModel.update(
		{
			nama_siswa,
			nis,
			nisn,
			nik,
			tempat_lahir,
			tanggal_lahir,
			alamat,
			sekolah_asal,
			anak_ke,
			status,
			angkatan,
			tahub_ajaran,
			keterangan,
		},
		{
			where: {
				id: id,
			},
		}
	)

	return {
		msg: 'Perbaharui data siswa berhasil',
	}
})

// task detail nilai
const getHasilBelajar = async (req, res) => {
	let { id } = req.params
	let { nama_mapel, page, pageSize, ta_id } = req.query

	console.log('ini dia', req.query)

	const result = await mapelModel.findAll({
		attributes: {
			exclude: 'mapel_id',
			include: ['id'],
		},
		where: {
			...(checkQuery(nama_mapel) && {
				nama_mapel,
			}),
		},
		limit: pageSize,
		offset: page,
		include: [
			{
				model: hasilBelajarModel,
				require: true,
				as: 'hasil_belajar',
				where: {
					...(checkQuery(ta_id) && {
						ta_id,
					}),
					student_id: id,
				},
			},
		],
	})

	if (result.length === 0) {
		return res.json({
			status: 'Gagal medapatkan data',
			data: null,
		})
	}

	return res.json({
		status: 'Success',
		data: result,
		page,
		pageSize,
	})
}

module.exports = {
	listSiswa,
	createSiswaKelas,
	deleteSiswaKelas,
	detailSiswa,
	updateSiswa,
	getHasilBelajar,
}

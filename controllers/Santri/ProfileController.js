const studentModel = require('../../models').student
const userModel = require('../../models').user

const updateImage = async (req, res) => {
	const user = await userModel.findOne({
		where: {
			id: req.id
		}
	});

	if(!user) {
		res.status(403).json({
			msg: 'Ada kesalahan!'
		});
	}

	await user.update({ image: req.body.url })

	return res.json({
		status: 'Berhasil Update Data',
		data: user
	});
}

const profile = async (req, res) => {
  console.log(req.student_id)

	const siswa = await studentModel.findOne({
		where: {
			user_id: req.id,
		},
		include: [
			{
				model: userModel,
				as: 'user'
			}
		]
	})

	if (!siswa) {
		res.status(403).json({
			msg: 'Terjadi Kesalahan',
		})
	}

	return res.json({
		siswa,
	})
}


const updateSiswa = async (req, res) => {
	try {
		const { nama_siswa, nik, tempat_lahir, tanggal_lahir, alamat, sekolah_asal, jenis_kelamin, anak_ke } = req.body

		const detail = await studentModel.findOne({
			where: {
				id: req.student_id
			},
		})

		if (!detail) {
			return res.json({
				status: 'Terjadi Kesalahan',
				msg: 'Santri tidak ditemukan',
				data: detail,
			})
		}

		const fieldsToUpdate = {}

		if (nama_siswa) fieldsToUpdate.nama_siswa = nama_siswa
		if (nik) fieldsToUpdate.nik = nik
		if (tempat_lahir) fieldsToUpdate.tempat_lahir = tempat_lahir
		if (tanggal_lahir) fieldsToUpdate.tanggal_lahir = tanggal_lahir
		if (alamat) fieldsToUpdate.alamat = alamat
		if (sekolah_asal) fieldsToUpdate.sekolah_asal = sekolah_asal
		if (jenis_kelamin) fieldsToUpdate.jenis_kelamin = jenis_kelamin
		if (anak_ke) fieldsToUpdate.anak_ke = anak_ke

		if (Object.keys(fieldsToUpdate).length > 0) {
			await studentModel.update(fieldsToUpdate, {
				where: { id: req.student_id },
			})  

			return res.json({
				status: 'Success',
				msg: 'Data berhasil di update',
			})
		} else {
			return res.json({
				status: 'No Change',
				msg: 'Tidak ada data yang diperbarui',
			})
		}
	} catch (err) {
		return res.status(403).send('Ada Kesalahan')
	}
}

module.exports = { profile, updateSiswa, updateImage }

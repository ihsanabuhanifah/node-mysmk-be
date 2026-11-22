const { Op } = require('sequelize')
const { checkQuery } = require('../../utils/format')

const nilaiModel = require('../../models').nilai
const mapelModel = require('../../models').mapel
const kelasModel = require('../../models').kelas
const tahunAjaranModel = require('../../models').ta
const ujianModel = require('../../models').ujian

const listHasilUjain = async (req, res) => {
  try {
	let { page, pageSize, nama_mapel, judul_ujian, kelas } = req.query

	let pageFromFE = parseFloat(req.page)

	const { rows, count } = await nilaiModel.findAndCountAll({
		where: {
			student_id: req.student_id,
			status: 'finish',
		},
	 ...(pageSize && { limit: Number(pageSize), offset: Number(page) || 0 }),
    order: [['createdAt', 'DESC']],
	
		include: [
			{
				model: mapelModel,
				as: 'mapel',
				attributes: {
					exclude: 'mapel_id',
					include: ['id'],
				},
				where: {
					...(checkQuery(nama_mapel) && {
						nama_mapel: {
							[Op.substring]: nama_mapel,
						},
					}),
				},
			},
			{
				model: kelasModel,
				as: 'kelas',
        where: {
          ...(checkQuery(kelas) && {
						nama_kelas: {
							[Op.like]: `${kelas} %`, 
						},
					}),
        }
			},
			{
				model: tahunAjaranModel,
				as: 'tahun_ajaran',
			},
			{
				model: ujianModel,
				as: 'ujian',
				// hanya kolom yang dibutuhkan (sebelumnya typo "atrributes" -> semua kolom ikut terkirim)
				attributes: ['id', 'judul_ujian', 'jenis_ujian', 'tipe_ujian', 'durasi', 'waktu_mulai', 'waktu_selesai'],
        where: {
          ...(checkQuery(judul_ujian) && {
						judul_ujian: {
							[Op.substring]: judul_ujian,
						},
					}),
        }
			},
		],
		

	})

	return res.json({
		status: 'Success',
		data: rows,
		page: pageFromFE,
		pageSize: pageSize,
		totalPage: Math.ceil(count / pageSize),
		count: count,
	})
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: 'Fail', msg: 'Terjadi Kesalahan' })
  }
}

module.exports = { listHasilUjain }

const { Op } = require('sequelize')
const { checkQuery } = require('../../utils/format')

const nilaiModel = require('../../models').nilai
const mapelModel = require('../../models').mapel
const kelasModel = require('../../models').kelas
const tahunAjaranModel = require('../../models').ta
const ujianModel = require('../../models').ujian

const listHasilUjain = async (req, res) => {
	let { page, pageSize, nama_mapel, judul_ujian, kelas } = req.query

	let pageFromFE = parseFloat(req.page)

	const { rows, count } = await nilaiModel.findAndCountAll({
		where: {
			student_id: req.student_id,
			status: 'finish',
		},
	 limit: pageSize,
      offset: page,
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
				atrributes: {
					include: ['judul_ujian'],
				},
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
}

module.exports = { listHasilUjain }

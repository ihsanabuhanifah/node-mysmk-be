const studentModel = require('../../models').student
const models = require('../../models')

const profile = async (req, res) => {
	try {
		const siswa = await studentModel.findAll({
			where: {
				user_id: req.id
			}
		});
		
		return res.json({
			siswa
		})
	} catch (err) {
		console.log(err)
		res.status(403).json({
			msg: 'Terjadi Kesalahan',
		})
	}
	res.json({
		status: 'ok',
	})
}

module.exports = { profile };
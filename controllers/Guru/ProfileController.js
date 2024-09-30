const teacherModel = require('../../models').teacher
const userModel = require('../../models').user

const profile = async (req, res) => {
  console.log(req.student_id)

	const teacher = await teacherModel.findOne({
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

	if (!teacher) {
		res.status(403).json({
			msg: 'Terjadi Kesalahan',
		})
	}

	return res.json({
		teacher,
	})
}

module.exports = { profile }
const messagesModel = require('../../models').messages

const listChat = async(req, res) => {
  const { student_id, teacher_id } = req.query

  const data = await messagesModel.findOne({
    where: {
      student_id: student_id,
      teacher_id: teacher_id
    }
  })

  return res.json(data)
}

module.exports = {
  listChat
}
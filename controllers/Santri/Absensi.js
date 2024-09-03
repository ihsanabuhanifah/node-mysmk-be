const absensiModel = require('../../models').absensi_kelas;
const { Op } = require('sequelize');

const listTidakHadir = async (req, res) => {
  const result = await absensiModel.findAll({
    where: {
      student_id: req.student_id,
      semester: 3,
      status_kehadiran: {
        [Op.notIn]: [1, 6]
      }
    },
    group: ['createdAt', 'student_id', 'semester'],
    order: [['tanggal', 'ASC']]
  })

  return res.json({
    status: 'Success',
    data: result,
  })
}

module.exports = { listTidakHadir }
const absensiModel = require('../../models').absensi_kelas;
const { Op } = require('sequelize');

const listTidakHadir = async (req, res) => {
  let { s } = req.query;

  const result = await absensiModel.findAll({
    where: {
      student_id: req.student_id,
      semester: s,
      status_kehadiran: {
        [Op.notIn]: [1, 6]
      },
      status_absensi: true
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
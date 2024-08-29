const nilaiModel = require('../../models').nilai;
const mapelModel = require('../../models').mapel;
const kelasModel = require('../../models').kelas;
const tahunAjaranModel = require('../../models').ta;
const ujianModel = require('../../models').ujian;



const listHasilUjain = async (req, res) => {
  const result = await nilaiModel.findAll({
    where: {
      student_id: req.student_id
    },
    include: [
      {
        model: mapelModel,
        as: 'mapel',
        attributes: {
          exclude: 'mapel_id',
          include: ['id']
        }
      },
      {
        model: kelasModel,
        as: 'kelas',
      },
      {
        model: tahunAjaranModel,
        as: 'tahun_ajaran',
      },
      {
        model: ujianModel,
        as: 'ujian',
      },
    ]
  })

  return res.json({
    status: 'Success',
    data: result
  })
}

module.exports = { listHasilUjain }
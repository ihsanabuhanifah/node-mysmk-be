const nilaiModel = require('../../models').nilai;
const mapelModel = require('../../models').mapel;
const kelasModel = require('../../models').kelas;
const tahunAjaranModel = require('../../models').ta;
const ujianModel = require('../../models').ujian;



const listHasilUjain = async (req, res) => {
  let { page, pageSize } = req.query

  const { rows, count } = await nilaiModel.findAndCountAll({
    where: {
      student_id: req.student_id,
      status: 'finish'
    },
    limit: pageSize,
    offset: page,
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
        atrributes: {
          include: ['judul_ujian']
        },
      },
    ]
  })

  return res.json({
    status: 'Success',
    data: rows,
    page: page,
    pageSize: pageSize,
    totalPage: Math.ceil(count / pageSize)
  })
}

module.exports = { listHasilUjain }
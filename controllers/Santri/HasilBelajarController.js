const mapelModel = require('../../models').mapel;
const nilaiModel = require('../../models').nilai;
const tahunAjaranModel = require('../../models').ta;
const hasilBelajarModel = require('../../models').hasil_belajar;
const ujianModel = require('../../models').ujian;
const models = require("../../models");
const { checkQuery } = require('../../utils/format');
const { Op } = require('sequelize')

const getHasilBelajar = async (req, res) => {
  let { nama_mapel, ta_id, tanggal } = req.query;

  console.log(req.student_id)
  const result = await mapelModel.findAll({
    where: {
      ...(checkQuery(nama_mapel) && {
        nama_mapel: {
          [Op.substring]: nama_mapel
        }
      }),
    },
    attributes: {
      exclude: 'mapel_id',
      include: ['id']
    },
    include: [
      {
        model: hasilBelajarModel,
        require: true,
        as: 'hasil_belajar',
        where: { 
          ...(checkQuery(tanggal) && {
            createdAt: {
              [Op.gte]: tanggal
            }
          }),
          student_id: req.student_id
        },
        include: [
          {
            where: {
              ...(checkQuery(ta_id) && {
                nama_tahun_ajaran: ta_id,
              }),
            },
            model: tahunAjaranModel,
            require: true,
            as: 'tahun_ajaran'
          }
        ]
      }
    ]
  }) 

  return res.json({
    status: 'Success',
    data: result
  })
}

const detailHasilBelajar = async (req, res) => {
  console.log(req.params.id)

  const result = await nilaiModel.findAll({
    where: { mapel_id: req.params.id, student_id: req.student_id },
    include: [
      {
        model: mapelModel,
        as: 'mapel',
        attributes: ['nama_mapel', 'kategori']
      },
      {
        model: ujianModel,
        as: 'ujian'
      },
      {
        model: tahunAjaranModel,
        require: true,
        as: 'tahun_ajaran'
      }
    ]
  })

  return res.json({
    status: 'Success',
    data: result
  })
}

module.exports = { getHasilBelajar, detailHasilBelajar }
const AbsensiModel = require("../../models").absensi_kelas;
const { Op } = require("sequelize");

async function create(req, res) {
  let { payload } = req.body;
  payload.map((data) => (data.teacher_id = req.teacher_id));

  const cek = await AbsensiModel.findAll({
      attributes : ['id'],
      where : {
          [Op.and] : [
              {tanggal : payload[0]?.tanggal},
              {kelas_id : payload[0]?.kelas_id},
              {teacher_id : payload[0]?.teacher_id},
              {mapel_id : payload[0]?.mapel_id},
             
          ]
      }
  })

  if(cek.length !== 0){
      return res.status(403).json({
          status : 'Fail',
          msg : 'Anda sudah mengabsen kelas ini'
      })
  }

  const absensi = await AbsensiModel.bulkCreate(payload);
  console.log(absensi);
  return res.status(201).json({
    status: "Success",
    msg: "Absensi Berhasil di Simpan",
  });
  try {
  } catch (err) {
    return res.status(402).json({
      status: "Fail",
      msg: "Terjadi Kesalahan",
    });
  }
}

module.exports = { create };

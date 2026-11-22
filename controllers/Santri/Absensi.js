const absensiModel = require('../../models').absensi_kelas;
const statusAbsensiModel = require('../../models').status_kehadiran;
const { Op, fn, col } = require('sequelize');

// Daftar ketidakhadiran siswa (selain hadir & belum absensi) pada semester tertentu.
// Cron membuat 1 baris absensi per JAM pelajaran, jadi dikelompokkan per
// tanggal + mapel + status agar 1 mapel di 1 hari dihitung sekali.
// Kompatibel dengan sql_mode ONLY_FULL_GROUP_BY (hanya kolom GROUP BY + agregat).
const listTidakHadir = async (req, res) => {
  let { s } = req.query;

  const result = await absensiModel.findAll({
    attributes: [
      [fn('MIN', col('absensi_kelas.id')), 'id'],
      'tanggal',
      'mapel_id',
      'status_kehadiran',
      [fn('COUNT', col('absensi_kelas.id')), 'jumlah_jam'],
    ],
    where: {
      student_id: req.student_id,
      semester: s,
      status_kehadiran: {
        [Op.notIn]: [1, 6]
      },
      status_absensi: true
    },
    include: [
      {
        model: statusAbsensiModel,
        as: 'kehadiran'
      }
    ],
    group: ['tanggal', 'mapel_id', 'status_kehadiran'],
    order: [['tanggal', 'ASC']]
  })

  return res.json({
    status: 'Success',
    data: result,
  })
}

module.exports = { listTidakHadir }

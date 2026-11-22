'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class riwayat_kelas extends Model {
    static associate(models) {
      riwayat_kelas.belongsTo(models.student, { as: 'siswa', foreignKey: 'student_id' });
      riwayat_kelas.belongsTo(models.kelas, { as: 'dari_kelas', foreignKey: 'dari_kelas_id' });
      riwayat_kelas.belongsTo(models.kelas, { as: 'ke_kelas', foreignKey: 'ke_kelas_id' });
      riwayat_kelas.belongsTo(models.ta, { as: 'dari_ta', foreignKey: 'dari_ta_id' });
      riwayat_kelas.belongsTo(models.ta, { as: 'ke_ta', foreignKey: 'ke_ta_id' });
      riwayat_kelas.belongsTo(models.user, { as: 'oleh', foreignKey: 'created_by' });
    }
  }
  riwayat_kelas.init(
    {
      student_id: DataTypes.INTEGER,
      jenis: DataTypes.STRING,
      dari_kelas_id: DataTypes.INTEGER,
      dari_ta_id: DataTypes.INTEGER,
      dari_semester: DataTypes.INTEGER,
      ke_kelas_id: DataTypes.INTEGER,
      ke_ta_id: DataTypes.INTEGER,
      ke_semester: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'riwayat_kelas',
      tableName: 'riwayat_kelas',
    }
  );
  return riwayat_kelas;
};

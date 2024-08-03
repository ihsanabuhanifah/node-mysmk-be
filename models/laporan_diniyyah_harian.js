'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class laporan_diniyyah_harian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      laporan_diniyyah_harian.belongsTo(models.student, {
        as : "siswa",
        foreignKey : "student_id"
      });
      laporan_diniyyah_harian.belongsTo(models.laporan_harian_pkl, {
        as : "laporan_harian_pkl",
        foreignKey : "laporan_harian_pkl_id"
      });
    }
  };
  laporan_diniyyah_harian.init({
    dzikir_pagi: DataTypes.BOOLEAN,
    dzikir_petang: DataTypes.BOOLEAN,
    sholat_shubuh: DataTypes.BOOLEAN,
    sholat_dzuhur: DataTypes.BOOLEAN,
    sholat_ashar: DataTypes.BOOLEAN,
    sholat_magrib: DataTypes.BOOLEAN,
    sholat_isya: DataTypes.BOOLEAN,
    tanggal : DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'laporan_diniyyah_harian',
  });
  return laporan_diniyyah_harian;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class laporan_guru_piket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      laporan_guru_piket.belongsTo(models.teacher, {
        as: "guru",
        foreignKey: "teacher_id",
      });
      laporan_guru_piket.belongsTo(models.teacher, {
        as: "diperiksa",
        foreignKey: "diperiksa_oleh",
      });
      laporan_guru_piket.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
    }
  };
  laporan_guru_piket.init({
    teacher_id: DataTypes.INTEGER,
    tanggal: DataTypes.DATEONLY,
    laporan: DataTypes.TEXT,
    diperiksa_oleh: DataTypes.INTEGER,
    ta_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'laporan_guru_piket',
  });
  return laporan_guru_piket;
};
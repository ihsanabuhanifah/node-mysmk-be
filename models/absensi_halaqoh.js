'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class absensi_halaqoh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      absensi_halaqoh.belongsTo(models.student);
      absensi_halaqoh.belongsTo(models.teacher);
    }
  };
  absensi_halaqoh.init({
    student_id: DataTypes.INTEGER,
    teacher_id: DataTypes.INTEGER,
    tanggal: DataTypes.DATEONLY,
    dari_surat: DataTypes.STRING,
    sampai_surat: DataTypes.STRING,
    dari_ayat: DataTypes.STRING,
    sampai_ayat: DataTypes.STRING,
    total_halaman: DataTypes.STRING,
    status_kehadiran: DataTypes.INTEGER,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'absensi_halaqoh',
  });
  return absensi_halaqoh;
};
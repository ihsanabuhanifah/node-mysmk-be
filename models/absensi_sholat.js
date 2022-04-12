'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class absensi_sholat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      absensi_sholat.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
     
      absensi_sholat.belongsTo(models.teacher, {
        as: "guru",
        foreignKey: "created_by",
      });
    }
  };
  absensi_sholat.init({
    student_id: DataTypes.INTEGER,
    tanggal: DataTypes.DATE,
    waktu: DataTypes.INTEGER,
    keterangan: DataTypes.INTEGER,
    alasan: DataTypes.STRING,
    created_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'absensi_sholat',
  });
  return absensi_sholat;
};
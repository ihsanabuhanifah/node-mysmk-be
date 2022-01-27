"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class absensi_kelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      absensi_kelas.belongsTo(models.kelas);
      absensi_kelas.belongsTo(models.student);
      absensi_kelas.belongsTo(models.mapel);
      absensi_kelas.belongsTo(models.teacher);
    }
  }
  absensi_kelas.init(
    {
      tanggal: DataTypes.DATEONLY,
      teacher_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      kelas_id: DataTypes.INTEGER,
      mapel_id: DataTypes.INTEGER,
      status_kehadiran: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      semester: DataTypes.INTEGER,
      ta_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "absensi_kelas",
    }
  );
  return absensi_kelas;
};

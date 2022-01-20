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
      teacherId: DataTypes.INTEGER,
      studentId: DataTypes.INTEGER,
      kelasId: DataTypes.INTEGER,
      mapelId: DataTypes.INTEGER,
      pelajaranKe: DataTypes.INTEGER,
      materi: DataTypes.STRING,
      statusKehadiran: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      semester: DataTypes.INTEGER,
      tahunAjaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "absensi_kelas",
    }
  );
  return absensi_kelas;
};

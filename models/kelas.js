"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class kelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      kelas.hasMany(models.kelas_student, {
        as: "kelas_student",
        foreignKey: "kelas_id",
      });
      kelas.hasMany(models.nilai, {
        as: "nilai",
        foreignKey: "kelas_id",
      });
      kelas.hasMany(models.jadwal, {
        as: "jadwal",
        foreignKey: "kelas_id",
      });
      kelas.hasMany(models.absensi_kelas, {
        as: "absensi_kelas",
        foreignKey: "kelas_id",
      });
      kelas.hasMany(models.agenda_kelas, {
        as: "agenda_kelas",
        foreignKey: "kelas_id",
      });
      kelas.hasMany(models.ujian, {
        as: "ujian",
        foreignKey: "kelas_id",
      });
    }
  }
  kelas.init(
    {
      nama_kelas: DataTypes.STRING,
      tahun_ajaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kelas",
    }
  );
  return kelas;
};

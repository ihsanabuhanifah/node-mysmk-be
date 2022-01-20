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
      kelas.hasMany(
        models.kelas_student,
        { as: "kelas_student" },
        { foreignKey: "kelasId" }
      );
      kelas.hasMany(
        models.absensi_kelas,
        { as: "absensi_kelas" },
        { foreignKey: "kelasId" }
      );
    }
  }
  kelas.init(
    {
      namaKelas: DataTypes.STRING,
      tahunAjaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kelas",
    }
  );
  return kelas;
};

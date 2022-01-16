"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Kelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Kelas.hasMany(
        models.KelasStudent,
        { as: "kelasStudent" },
        { foreignKey: "KelasId" }
      );
      Kelas.hasMany(
        models.AbsensiKelas,
        { as: "absensikelas" },
        { foreignKey: "KelasId" }
      );
    }
  }
  Kelas.init(
    {
      namaKelas: DataTypes.STRING,
      tahunAjaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Kelas",
    }
  );
  return Kelas;
};

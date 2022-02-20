"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class alquran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      alquran.hasMany(models.absensi_halaqoh, {
        as: "surat_awal",
        foreignKey: "dari_surat",
      });
      alquran.hasMany(models.absensi_halaqoh, {
        as: "surat_akhir",
        foreignKey: "sampai_surat",
      });
    }
  }
  alquran.init(
    {
      nama_surat: DataTypes.STRING,
      nama_surat_arabic: DataTypes.STRING,
      jumlah_ayat: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "alquran",
    }
  );
  return alquran;
};

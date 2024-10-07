"use strict";
const { Model } = require("sequelize");
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
        as: "siswa",
        foreignKey: "student_id",
      });
      laporan_diniyyah_harian.belongsTo(models.laporan_harian_pkl, {
        as: "laporan_diniyyah_harian",
        foreignKey: "laporan_harian_pkl_id",
      });
    }
  }
  laporan_diniyyah_harian.init(
    {
      dzikir_pagi: DataTypes.BOOLEAN,
      dzikir_petang: DataTypes.BOOLEAN,
      student_id: DataTypes.INTEGER,
      sholat_shubuh: DataTypes.ENUM("berjamaah", "sendirian", "tidak solat"),
      sholat_dzuhur: DataTypes.ENUM("berjamaah", "sendirian", "tidak solat"),
      sholat_ashar: DataTypes.ENUM("berjamaah", "sendirian", "tidak solat"),
      sholat_magrib: DataTypes.ENUM("berjamaah", "sendirian", "tidak solat"),
      sholat_isya: DataTypes.ENUM("berjamaah", "sendirian", "tidak solat"),
      tanggal: DataTypes.DATEONLY,
      laporan_harian_pkl_id: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      dari_surat: DataTypes.STRING,
      sampai_surat: DataTypes.STRING,
      dari_ayat: DataTypes.INTEGER,
      sampai_ayat: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "laporan_diniyyah_harian",
    }
  );
  return laporan_diniyyah_harian;
};

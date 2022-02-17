"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class absensi_halaqoh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      absensi_halaqoh.belongsTo(models.student, {
        as: "student",
        foreignKey: "students_id",
      });
      absensi_halaqoh.belongsTo(models.halaqoh, {
        as: "halaqoh",
        foreignKey: "halaqoh_id",
      });
     
    }
  }
  absensi_halaqoh.init(
    {
      student_id: DataTypes.INTEGER,
      halaqoh_id: DataTypes.INTEGER,
      tanggal: DataTypes.DATEONLY,
      dari_surat: DataTypes.INTEGER,
      sampai_surat: DataTypes.INTEGER,
      dari_ayat: DataTypes.INTEGER,
      sampai_ayat: DataTypes.INTEGER,
      total_halaman: DataTypes.DECIMAL,
      juz_ke: DataTypes.INTEGER,
      ketuntasan_juz: DataTypes.INTEGER,
      status_kehadiran: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      kegiatan: DataTypes.INTEGER,
      
      waktu : DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "absensi_halaqoh",
    }
  );
  return absensi_halaqoh;
};

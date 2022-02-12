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
      absensi_kelas.belongsTo(models.kelas, {
        as: "kelas",
        foreignKey: "kelas_id",
      });
      absensi_kelas.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      absensi_kelas.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });
      absensi_kelas.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      absensi_kelas.belongsTo(models.status_kehadiran, {
        as: "kehadiran",
        foreignKey: "status_kehadiran",
      });
      absensi_kelas.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
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
      status_absensi : DataTypes.TINYINT,
    },
    {
      sequelize,
      modelName: "absensi_kelas",
    }
  );
  return absensi_kelas;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class hasil_belajar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      hasil_belajar.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      hasil_belajar.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      hasil_belajar.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
      hasil_belajar.belongsTo(models.kelas, {
        as: "kelas",
        foreignKey: "kelas_id",
      });

      hasil_belajar.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });
      // define association here
    }
  }
  hasil_belajar.init(
    {
      teacher_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      kelas_id: DataTypes.INTEGER,
      mapel_id: DataTypes.INTEGER,
      nilai: DataTypes.INTEGER,
      deskripsi: DataTypes.STRING,
      is_locked: DataTypes.BOOLEAN,
      rata_nilai_tugas: DataTypes.INTEGER,
      rata_nilai_harian: DataTypes.INTEGER,
      rata_nilai_pts: DataTypes.INTEGER,
      rata_nilai_pas: DataTypes.INTEGER,
      rata_nilai_us: DataTypes.INTEGER,
      ta_id: DataTypes.INTEGER,
      rata_nilai_kehadiran: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "hasil_belajar",
    }
  );
  return hasil_belajar;
};

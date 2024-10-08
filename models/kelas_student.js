"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kelas_student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      kelas_student.belongsTo(models.kelas, {
        as: "kelas",
        foreignKey: "kelas_id",
      });
      kelas_student.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      kelas_student.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
    }
    
  }
  kelas_student.init(
    {
      kelas_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      semester: DataTypes.INTEGER,
      ta_id: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "kelas_student",
    }
  );
  return kelas_student;
};

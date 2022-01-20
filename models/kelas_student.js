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
      kelas_student.belongsTo(models.kelas)
        kelas_student.belongsTo(models.student);
    }
  }
  kelas_student.init(
    {
      kelasId: DataTypes.INTEGER,
      studentId: DataTypes.INTEGER,
      semester: DataTypes.INTEGER,
      tahunAjaran: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "kelas_student",
    }
  );
  return kelas_student;
};

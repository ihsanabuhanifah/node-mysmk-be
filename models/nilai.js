"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class nilai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  nilai.init(
    {
      ujian_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      jawaban: DataTypes.TEXT,
      waktu_tersisa: DataTypes.INTEGER,
      exam1: DataTypes.DECIMAL(4, 2),
      exam2: DataTypes.DECIMAL(4, 2),
      exam3: DataTypes.DECIMAL(4, 2),
      exam4: DataTypes.DECIMAL(4, 2),
      examResult: DataTypes.DECIMAL(4, 2),
    },
    {
      sequelize,
      modelName: "nilai",
    }
  );
  return nilai;
};

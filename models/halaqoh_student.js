"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class halaqoh_student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      halaqoh_student.belongsTo(models.halaqoh, {
        as: "halaqoh",
        foreignKey: "halaqoh_id",
      });
      halaqoh_student.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
    }
  }
  halaqoh_student.init(
    {
      halaqoh_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "halaqoh_student",
    }
  );
  return halaqoh_student;
};

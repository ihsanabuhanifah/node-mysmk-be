"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Student.belongsTo(models.User),
        Student.hasMany(
          models.Parent,
          { as: "parent" },
          { foreignKey: "StudentId" }
        );
    }
  }
  Student.init(
    {
      UserId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      tempatLahir: DataTypes.STRING,
      tanggalLahir: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Student",
    }
  );
  return Student;
};

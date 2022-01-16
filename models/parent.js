"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Parent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Parent.belongsTo(models.User), Parent.belongsTo(models.Student);
    }
  }
  Parent.init(
    {
      UserId: DataTypes.INTEGER,
      StudentId: DataTypes.INTEGER,
      namaWali: DataTypes.STRING,
      hubungan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Parent",
    }
  );
  return Parent;
};

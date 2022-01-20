"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class parent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      parent.belongsTo(models.user);
      parent.belongsTo(models.student);
    }
  }
  parent.init(
    {
      user_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      nama_wali: DataTypes.STRING,
      hubungan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "parent",
    }
  );
  return parent;
};

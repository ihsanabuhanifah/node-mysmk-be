"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LoginHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LoginHistory.belongsTo(models.User)
    }
  }
  LoginHistory.init(
    {
      UserId: DataTypes.INTEGER,
      device: DataTypes.STRING,

      ipAddress: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "LoginHistory",
    }
  );
  return LoginHistory;
};

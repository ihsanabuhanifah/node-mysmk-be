"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user_role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      user_role.belongsTo(models.user);
      user_role.belongsTo(models.role);
    }
  }
  user_role.init(
    {
      UserId: DataTypes.INTEGER,
      RoleId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "user_role",
    }
  );
  return user_role;
};

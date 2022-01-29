"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      user.hasMany(models.user_role, { as: "userRole", foreignKey: "user_id" });
      user.hasMany(models.token_reset_password, {
        as: "token",
        foreignKey: "user_id",
      });
      user.hasMany(models.student, { as: "student", foreignKey: "user_id" });
      user.hasMany(models.parent, { as: "parent", foreignKey: "user_id" });
      user.hasMany(models.teacher, { as: "teacher", foreignKey: "user_id" });
    }
  }
  user.init(
    {
      name: DataTypes.STRING,

      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      image: DataTypes.STRING,
      email_verified: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
    }
  );
  return user;
};

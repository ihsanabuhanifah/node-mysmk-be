"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(
        models.EmailVerified,
        { as: "EmailVerified" },
        { foreignKey: "UserId" }
      );
      User.hasMany(
        models.LoginHistory,
        { as: "loginHistory" },
        { foreignKey: "UserId" }
      );
      User.hasMany(
        models.UserRole,
        { as: "userRole" },
        { foreignKey: "UserId" }
      );
      User.hasMany(
        models.tokenResetPassword,
        { as: "token" },
        { foreignKey: "UserId" }
      );
      User.hasMany(
        models.Student,
        { as: "student" },
        { foreignKey: "UserId" }
      );
      User.hasMany(
        models.Parent,
        { as: "parent" },
        { foreignKey: "UserId" }
      );
      User.hasMany(
        models.Teacher,
        { as: "teacher" },
        { foreignKey: "UserId" }
      );
    }
  }
  User.init(
    {
      name: DataTypes.STRING,

      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      image: DataTypes.STRING,
      emailVerified: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};

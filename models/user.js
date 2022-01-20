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
      
      
      user.hasMany(
        models.user_role,
        { as: "userRole" },
        { foreignKey: "userId" }
      );
      user.hasMany(
        models.token_reset_password,
        { as: "token" },
        { foreignKey: "userId" }
      );
      user.hasMany(
        models.student,
        { as: "student" },
        { foreignKey: "userId" }
      );
      user.hasMany(
        models.parent,
        { as: "parent" },
        { foreignKey: "userId" }
      );
      user.hasMany(
        models.teacher,
        { as: "teacher" },
        { foreignKey: "userId" }
      );
    }
  }
  user.init(
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
      modelName: "user",
    }
  );
  return user;
};

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
      user_role.belongsTo(models.user, {
        as: "user",
        foreignKey: "user_id",
      });
      user_role.belongsTo(models.role, {
        as: "role",
        foreignKey: "role_id",
      });


      
    }
    
  }
  user_role.init(
    {
      user_id: DataTypes.INTEGER,
      role_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "user_role",
    }
  );
  return user_role;
};

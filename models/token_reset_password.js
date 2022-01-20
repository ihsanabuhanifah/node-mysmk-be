'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class token_reset_password extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      token_reset_password.belongsTo(models.user);
    }
  };
  token_reset_password.init({
    userId: DataTypes.INTEGER,
    token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'token_reset_password',
  });
  return token_reset_password;
};
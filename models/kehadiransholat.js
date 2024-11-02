'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kehadiransholat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  kehadiransholat.init({
    waktu: DataTypes.STRING,
    kehadiran: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'kehadiransholat',
    underscored: true,
  });
  return kehadiransholat;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mitraSekolah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  mitraSekolah.init({
    imgUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'mitraSekolah',
  });
  return mitraSekolah;
};
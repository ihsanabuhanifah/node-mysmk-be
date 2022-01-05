'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alquran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Alquran.init({
    name: DataTypes.STRING,
    nameSurah : DataTypes.STRING,
    nameSurahArabic : DataTypes.STRING,
    jumlahAyat : DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'Alquran',
  });
  return Alquran;
};
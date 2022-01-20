'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class alquran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  alquran.init({
   
    namaSurat : DataTypes.STRING,
    namaSuratArabic : DataTypes.STRING,
    jumlahAyat : DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'alquran',
  });
  return alquran;
};
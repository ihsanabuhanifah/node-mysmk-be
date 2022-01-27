'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class daftar_pelanggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  daftar_pelanggaran.init({
    nama_pelanggaran: DataTypes.STRING,
    kategori: DataTypes.STRING,
    point: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'daftar_pelanggaran',
  });
  return daftar_pelanggaran;
};
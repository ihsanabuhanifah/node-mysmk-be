'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class konfigurasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  konfigurasi.init({
    namaSekolah: DataTypes.STRING,
    namaKepalaSekeolah: DataTypes.STRING,
    npsn: DataTypes.MEDIUMINT,
    semesterAktif: DataTypes.TINYINT,
    tahunAjaranAktif: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'konfigurasi',
  });
  return konfigurasi;
};
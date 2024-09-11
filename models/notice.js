'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  notice.init({
    judul_notice: DataTypes.STRING,
    tanggal_pengumuman: DataTypes.DATE,
    gambar_notice: DataTypes.STRING,
    isi_notice: DataTypes.TEXT,
    file_notice: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'notice',
    tableName: 'notice'
  });
  return notice;
};
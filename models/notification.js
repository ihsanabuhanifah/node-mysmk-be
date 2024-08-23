'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     
    }
  }
  notification.init({
    tanggal: DataTypes.DATE,
    isi_pesan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'notification',
  });
  return notification;
};
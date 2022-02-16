'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class scheduleMonitor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  scheduleMonitor.init({
    tanggal: DataTypes.DATE,
    keterangan: DataTypes.STRING,
    kegiatan : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'scheduleMonitor',
  });
  return scheduleMonitor;
};
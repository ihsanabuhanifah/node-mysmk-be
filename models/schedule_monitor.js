'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class schedule_monitor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  schedule_monitor.init({
    tanggal: DataTypes.DATE,
    keterangan: DataTypes.STRING,
    kegiatan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'schedule_monitor',
  });
  return schedule_monitor;
};
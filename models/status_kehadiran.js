'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class status_kehadiran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      status_kehadiran.hasMany(models.absensi_kelas, {
        as: "absensi_kelas",
        foreignKey: "status_kehadiran",
      });
    }
  };
  status_kehadiran.init({
    nama_status_kehadiran: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'status_kehadiran',
  });
  return status_kehadiran;
};
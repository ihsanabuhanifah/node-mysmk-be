'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mapel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      mapel.hasMany(
        models.absensi_kelas,
        { as: "absensi_kelas" },
        { foreignKey: "mapel_id" }
      );
    }
  };
  mapel.init({
    nama_mapel: DataTypes.STRING,
    kategori: DataTypes.STRING,
    
  }, {
    sequelize,
    modelName: 'mapel',
  });
  return mapel;
};
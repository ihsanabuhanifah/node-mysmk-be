'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mapel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Mapel.hasMany(
        models.AbsensiKelas,
        { as: "absensikelas" },
        { foreignKey: "MapelId" }
      );
    }
  };
  Mapel.init({
    namaMapel: DataTypes.STRING,
    kategori: DataTypes.STRING,
    
  }, {
    sequelize,
    modelName: 'Mapel',
  });
  return Mapel;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kategori_pelanggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kategori_pelanggaran.hasMany(models.pelanggaran, {
        as: "pelanggaran",
        foreignKey: "kategori_id",
      });
    }
  };
  kategori_pelanggaran.init({
    nama: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'kategori_pelanggaran',
  });
  return kategori_pelanggaran;
};
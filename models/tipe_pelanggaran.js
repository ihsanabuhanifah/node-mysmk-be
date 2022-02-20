'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tipe_pelanggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // tipe_pelanggaran.hasMany(models.pelanggaran, {
      //   as: "pelanggaran",
      //   foreignKey: "tipe_id",
      // });
    }
  };
  tipe_pelanggaran.init({
    nama: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tipe_pelanggaran',
  });
  return tipe_pelanggaran;
};
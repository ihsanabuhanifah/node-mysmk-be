'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class testimoni_alumni extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  testimoni_alumni.init({
    nama: DataTypes.STRING,
    pekerjaan_sekarang:DataTypes.STRING,
    jurusan:DataTypes.STRING,
    testi:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'testimoni_alumni',
  });
  return testimoni_alumni;
};
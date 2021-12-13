'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Identitas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Identitas.belongsTo(models.User)
    }
  };
  Identitas.init({
    UserId: DataTypes.INTEGER,
    tempatLahir: DataTypes.STRING,
    tanggalLahir: DataTypes.DATEONLY,
    jenisKelamin : DataTypes.INTEGER,
    alamat : DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Identitas',
  });
  return Identitas;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pembayaran_spp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pembayaran_spp.belongsTo(models.parents, {
        as: "walisantri",
        foreignKey: "walsan_id"
      });

      pembayaran_spp.belongsTo({
        as: "pengguna",
        foreignKey: "user_id"
      })
    }
  }
  pembayaran_spp.init({
    user_id: DataTypes.INTEGER,
    walsan_id: DataTypes.INTEGER,
    tgl: DataTypes.DATE,
    foto: DataTypes.STRING,
    status: DataTypes.STRING,
    bulan: DataTypes.STRING,
    tahun: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pembayaran_spp',
  });
  return pembayaran_spp;
};
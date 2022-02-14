'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pelanggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pelanggaran.belongsTo(models.tipe_pelanggaran, {
        as: "tipe",
        foreignKey: "tipe_id",
      });
      pelanggaran.belongsTo(models.kategori_pelanggaran, {
        as: "kategori",
        foreignKey: "kate_id",
      });
      pelanggaran.hasMany(models.pelanggaran_siswa, {
        as: "pelanggaran_siswa",
        foreignKey: "pelanggaran_id",
      });
    }
  };
  pelanggaran.init({
    nama: DataTypes.STRING,
    tipe_id: DataTypes.INTEGER,
    kategori_id: DataTypes.INTEGER,
    point: DataTypes.INTEGER,
    hukuman: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pelanggaran',
  });
  return pelanggaran;
};
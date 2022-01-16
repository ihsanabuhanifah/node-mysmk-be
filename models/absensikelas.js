'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AbsensiKelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AbsensiKelas.belongsTo(models.Kelas),
      AbsensiKelas.belongsTo(models.Student);
      AbsensiKelas.belongsTo(models.Mapel)
    }
  };
  AbsensiKelas.init({
    date: DataTypes.DATEONLY,
    StudentId: DataTypes.INTEGER,
    KelasId: DataTypes.INTEGER,
    MapelId: DataTypes.INTEGER,
    materi: DataTypes.STRING,
    materi: DataTypes.STRING,
    alasan: DataTypes.TINYINT,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AbsensiKelas',
  });
  return AbsensiKelas;
};
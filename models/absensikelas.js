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
      AbsensiKelas,this.belongsTo(models.Mapel)
    }
  };
  AbsensiKelas.init({
    date: DataTypes.DATE,
    StudentId: DataTypes.INTEGER,
    KelasId: DataTypes.INTEGER,
    MapelId: DataTypes.INTEGER,
    materi: DataTypes.STRING,
    alasan: DataTypes.STRING,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AbsensiKelas',
  });
  return AbsensiKelas;
};
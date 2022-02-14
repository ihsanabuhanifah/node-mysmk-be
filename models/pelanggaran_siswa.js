'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pelanggaran_siswa extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  pelanggaran_siswa.init({
    tanggal: DataTypes.DATE,
    student_id: DataTypes.INTEGER,
    pelapor: DataTypes.INTEGER,
    pelanggaran_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    tindakan: DataTypes.STRING,
    penindak: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'pelanggaran_siswa',
  });
  return pelanggaran_siswa;
};
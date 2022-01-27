'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class agenda_kelas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      agenda_kelas.belongsTo(models.kelas);
      agenda_kelas.belongsTo(models.mapel);
      agenda_kelas.belongsTo(models.teacher);
    }
  };
  agenda_kelas.init({
    tanggal: DataTypes.DATEONLY,
    mapel_id: DataTypes.INTEGER,
    kelas_id: DataTypes.INTEGER,
    teacher_id: DataTypes.INTEGER,
    jam_ke: DataTypes.INTEGER,
    materi: DataTypes.STRING,
    keterangan:DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'agenda_kelas',
  });
  return agenda_kelas;
};
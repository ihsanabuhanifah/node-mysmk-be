'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class kehadiran_guru extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      kehadiran_guru.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });

    }
  };
  kehadiran_guru.init({
    tanggal: DataTypes.DATEONLY,
    jam_datang: DataTypes.TIME,
    jam_pulang: DataTypes.TIME,
    waktu: DataTypes.STRING,
    teacher_id: DataTypes.INTEGER,
    status : DataTypes.STRING,
    keterangan: DataTypes.STRING,

    
  }, {
    sequelize,
    modelName: 'kehadiran_guru',
  });
  return kehadiran_guru;
};
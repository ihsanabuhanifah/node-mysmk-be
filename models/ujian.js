'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ujian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      ujian.hasMany(models.nilai, {
        as: "nilai",
        foreignKey: "ujian_id",
      });

      ujian.belongsTo(models.kelas, {
        as: "kelas",
        foreignKey: "kelas_id",
      });
      ujian.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });
      ujian.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
    }
  };
  ujian.init({
    jenis_ujian: DataTypes.STRING,
    tipe_ujian: DataTypes.STRING,
    mapel_id: DataTypes.INTEGER,
    kelas_id: DataTypes.INTEGER,
    teacher_id: DataTypes.INTEGER,
    soal: DataTypes.TEXT,
    waktu_mulai: DataTypes.DATE,
    waktu_selesai: DataTypes.DATE,
    status: DataTypes.STRING,
    student_access: DataTypes.TEXT,
    
  }, {
    sequelize,
    modelName: 'ujian',
  });
  return ujian;
};
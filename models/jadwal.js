'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class jadwal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      jadwal.belongsTo(models.kelas, {
        as: "kelas",
        foreignKey: "kelas_id",
      });
      
      jadwal.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });
      jadwal.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
     
      jadwal.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
      // define association here
    }
  };
  jadwal.init({
    hari: DataTypes.STRING,
    kelas_id: DataTypes.INTEGER,
    teacher_id: DataTypes.INTEGER,
    mapel_id: DataTypes.INTEGER,
    jam_ke: DataTypes.INTEGER,
    semester: DataTypes.INTEGER,
    ta_id: DataTypes.INTEGER,
    student: DataTypes.STRING,
    status : DataTypes.TINYINT
  }, {
    sequelize,
    modelName: 'jadwal',
  });
  return jadwal;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bank_soal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      bank_soal.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });
      bank_soal.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
    }
  };
  bank_soal.init({
    materi: DataTypes.STRING,
    mapel_id: DataTypes.INTEGER,
    teacher_id: DataTypes.INTEGER,
    soal: DataTypes.STRING,
    tipe: DataTypes.STRING,
    soal: DataTypes.TEXT,
    jawaban : DataTypes.STRING,
    point : DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'bank_soal',
  });
  return bank_soal;
};
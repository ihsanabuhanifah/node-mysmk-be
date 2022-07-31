'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class guru_piket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      guru_piket.belongsTo(models.teacher, {
        as: "guru",
        foreignKey: "teacher_id",
      });
      guru_piket.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
    }
  };
  guru_piket.init({
    hari: DataTypes.STRING,
    teacher_id: DataTypes.INTEGER,
   
    ta_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    created_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'guru_piket',
  });
  return guru_piket;
};
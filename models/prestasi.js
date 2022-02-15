'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class prestasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      prestasi.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
    }
  };
  prestasi.init({
    tanggal: DataTypes.DATE,
    student_id: DataTypes.INTEGER,
    prestasi: DataTypes.STRING,
    kategori: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'prestasi',
  });
  return prestasi;
};
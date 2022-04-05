"use strict";
const { Model } = require("sequelize");
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
      prestasi.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
      prestasi.belongsTo(models.teacher, {
        as: "guru",
        foreignKey: "teacher_id",
      });
    }
  }
  prestasi.init(
    {
      tanggal: DataTypes.DATE,
      student_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
      prestasi: DataTypes.STRING,
      kategori: DataTypes.STRING,
      semester: DataTypes.INTEGER,
      ta_id: DataTypes.INTEGER,
      file_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "prestasi",
    }
  );
  return prestasi;
};

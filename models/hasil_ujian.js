"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class hasil_belajar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      hasil_belajar.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });

      hasil_belajar.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });
      // define association here
    }
  }
  hasil_belajar.init(
    {
      teacher_id: DataTypes.INTEGER,
      mapel_id: DataTypes.INTEGER,
      nilai: DataTypes.INTEGER,
      deskripsi: DataTypes.STRING,
      presentasi_tugas: DataTypes.INTEGER,
      presentasi_harian: DataTypes.INTEGER,
      presentasi_pts: DataTypes.INTEGER,
      presentasi_pas: DataTypes.INTEGER,
      presentasi_us: DataTypes.INTEGER,
      presentasi_kehadiran: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "hasil_belajar",
    }
  );
  return hasil_belajar;
};

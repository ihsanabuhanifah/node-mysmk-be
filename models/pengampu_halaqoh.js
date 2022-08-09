"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class pengampu_halaqoh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      pengampu_halaqoh.belongsTo(models.halaqoh, {
        as: "halaqoh",
        foreignKey: "halaqoh_id",
      });
      pengampu_halaqoh.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      pengampu_halaqoh.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
      pengampu_halaqoh.belongsTo(models.teacher, {
        as: "diabsen",
        foreignKey: "absen_by",
      });
      pengampu_halaqoh.belongsTo(models.status_kehadiran, {
        as: "kehadiran",
        foreignKey: "status_kehadiran",
      });
    }
  }
  pengampu_halaqoh.init(
    {
      halaqoh_id: DataTypes.INTEGER,
      tanggal: DataTypes.DATEONLY,
      teacher_id: DataTypes.INTEGER,
      status_kehadiran: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      ta_id:DataTypes.INTEGER,
      absen_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pengampu_halaqoh",
    }
  );
  return pengampu_halaqoh;
};

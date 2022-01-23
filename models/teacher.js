"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      teacher.belongsTo(models.user);
      teacher.hasMany(
        models.absensi_kelas,
        { as: "absensi_kelas" },
        { foreignKey: "teacher_id" }
      );
      teacher.hasMany(
        models.absensi_halaqoh,
        { as: "absensi_halaqoh" },
        { foreignKey: "steacher_id" }
      );
    }
  }
  teacher.init(
    {
      user_id: DataTypes.INTEGER,
      nama_guru: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "teacher",
    }
  );
  return teacher;
};

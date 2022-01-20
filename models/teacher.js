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
        { foreignKey: "teacherId" }
      );
    }
  }
  teacher.init(
    {
      userId: DataTypes.INTEGER,
      namaGuru: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "teacher",
    }
  );
  return teacher;
};

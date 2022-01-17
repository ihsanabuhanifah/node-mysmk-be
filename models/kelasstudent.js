"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KelasStudents extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      KelasStudents.belongsTo(models.Kelas),
        KelasStudents.belongsTo(models.Student);
    }
  }
  KelasStudents.init(
    {
      KelasId: DataTypes.INTEGER,
      StudentId: DataTypes.INTEGER,
      semester :  DataTypes.TINYINT,
      tahunAjaran : DataTypes.STRING,
      status : DataTypes.TINYINT
    },
    {
      sequelize,
      modelName: "KelasStudent",
    }
  );
  return KelasStudents;
};

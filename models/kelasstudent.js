"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KelasStudent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      KelasStudent.belongsTo(models.Kelas),
        KelasStudent.belongsTo(models.Student);
    }
  }
  KelasStudent.init(
    {
      KelasId: DataTypes.INTEGER,
      StudentId: DataTypes.INTEGER,
      semester :  DataTypes.INTEGER,
      tahunAjaran : DataTypes.STRING,
      status : DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "KelasStudent",
    }
  );
  return KelasStudent;
};

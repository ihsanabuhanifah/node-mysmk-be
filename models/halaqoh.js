"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class halaqoh extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      
      halaqoh.hasMany(models.halaqoh_student, {
        as: "halaqoh_student",
        foreignKey: "halaqoh_id",
      });
      halaqoh.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      halaqoh.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
    }
  }
  halaqoh.init(
    {
      nama_kelompok: DataTypes.STRING,
      teacher_id: DataTypes.INTEGER,
      status :DataTypes.INTEGER,
      semester: DataTypes.INTEGER,
      ta_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "halaqoh",
    }
  );
  return halaqoh;
};

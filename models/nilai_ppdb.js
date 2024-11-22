"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class nilai_ppdb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      nilai_ppdb.belongsTo(models.ujian, {
        foreignKey: "ujian_id",
      });
      nilai_ppdb.belongsTo(models.user, {
        foreignKey: "user_id",
      });
    }
  }

  nilai_ppdb.init(
    {
      ujian_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jawaban: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_lulus: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, // Nilai default: tidak lulus
      },
      status: {
        type: DataTypes.ENUM("finish", "open", "progress", "locked"),
        allowNull: false,
        defaultValue: "open",
      },
    },
    {
      sequelize,
      modelName: "nilai_ppdb",
      tableName: "nilai_ppdbs",
    }
  );

  return nilai_ppdb;
};

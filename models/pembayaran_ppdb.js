"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pembayaran_ppdb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pembayaran_ppdb.belongsTo(models.user, { as:'user', foreignKey: "user_id" });
      pembayaran_ppdb.belongsTo(models.teacher, {
        as: "guru",
        foreignKey: "teacher_id",
      });
    }
  }
  pembayaran_ppdb.init(
    {
      user_id: DataTypes.INTEGER,
      bukti_tf: DataTypes.STRING,
      nominal: DataTypes.DECIMAL(12, 2),
      teacher_id: DataTypes.INTEGER,
      bukti_tf: DataTypes.STRING,
      keterangan: DataTypes.STRING,
      status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "pembayaran_ppdb",
    }
  );
  return pembayaran_ppdb;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pembayaran_spp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      pembayaran_spp.belongsTo(models.parent, {
        as: "walsan",
        foreignKey: "walsan_id",
      });
      pembayaran_spp.belongsTo(models.student, {
        as: "murid",
        foreignKey: "student_id",
      });
      pembayaran_spp.belongsTo(models.teacher, {
        as: "guru",
        foreignKey: "teacher_id",
      });
      pembayaran_spp.belongsTo(models.ta, {
        as: "ta",
        foreignKey: "ta_id",
      });
    }
  }
  pembayaran_spp.init(
    {
      walsan_id: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      foto: DataTypes.STRING,
      status: DataTypes.STRING,
      bulan: DataTypes.STRING,
      tahun: DataTypes.STRING,
      nominal: DataTypes.DECIMAL(10, 2),
      tanggal_konfirmasi: DataTypes.DATE,
      teacher_id: DataTypes.INTEGER,
      no_telepon: DataTypes.STRING,
      keterangan: DataTypes.STRING,
      transaction_id: DataTypes.STRING,
      redirect_url: DataTypes.STRING,
      transaction_token: DataTypes.STRING,
      status_midtrans: DataTypes.STRING,
      order_id: DataTypes.STRING,
      tahun: DataTypes.STRING,
      ta_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pembayaran_spp",
    }
  );
  return pembayaran_spp;
};
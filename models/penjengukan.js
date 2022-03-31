"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class penjengukan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      penjengukan.belongsTo(models.user, {
        as : "user",
        foreignKey : 'user_id'
      });
      penjengukan.belongsTo(models.student , {
        as : "siswa",
        foreignKey : 'student_id'
      });
    }
  }
  penjengukan.init(
    {
      user_id: DataTypes.INTEGER,
      student_id : DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      kepentingan: DataTypes.STRING,
      status_approval: DataTypes.ENUM("menunggu", "disetujui", "ditolak"),
      alasan_ditolak: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "penjengukan",
    }
  );
  return penjengukan;
};

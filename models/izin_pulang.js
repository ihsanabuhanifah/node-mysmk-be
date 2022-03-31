"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class izin_pulang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      izin_pulang.belongsTo(models.user, {
        as: "user",
        foreignKey: "user_id",
      });
      izin_pulang.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      izin_pulang.belongsTo(models.teacher, {
        as: "pulang_approv_by",
        foreignKey: "approval_by",
      });
    }
  }
  izin_pulang.init(
    {
      user_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      izin_dari: DataTypes.DATE,
      izin_sampai: DataTypes.DATE,
      kepentingan: DataTypes.STRING,
      status_approval: DataTypes.ENUM("menunggu", "disetujui", "ditolak"),
      approval_by: DataTypes.INTEGER,
      alasan_ditolak: DataTypes.STRING,
      tanggal_kembali: DataTypes.DATE,
      jam_kembali_ke_sekolah: DataTypes.TIME,
      status_kepulangan: DataTypes.ENUM("terlambat", "tepat waktu"),
      jumlah_hari_terlambat: DataTypes.INTEGER,
      denda: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "izin_pulang",
    }
  );
  return izin_pulang;
};

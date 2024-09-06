"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ta.hasMany(models.absensi_kelas, {
        as: "absensi_kelas",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.jadwal, {
        as: "jadwal",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.agenda_kelas, {
        as: "agenda_kelas",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.halaqoh, {
        as: "halaqoh",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.pelanggaran_siswa, {
        as: "pelanggaran",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.prestasi, {
        as: "prestasi",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.guru_piket, {
        as: "guru_piket",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.laporan_guru_piket, {
        as: "laporan_guru_piket",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.pengampu_halaqoh, {
        as: "pengampu_halaqoh",
        foreignKey: "ta_id",
      });
      ta.hasMany(models.hasil_belajar, {
        as: "hasil_belajar",
        foreignKey: "kelas_id",
      });
      ta.hasMany(models.informasi_calon_santri, {
        foreignKey: "ta_id",
        as: "tahun_ajaran",
      });
    }
  }
  ta.init(
    {
      nama_tahun_ajaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ta",
    }
  );
  return ta;
};

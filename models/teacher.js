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
      teacher.hasMany(models.absensi_kelas, {
        as: "absensi_kelas",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.halaqoh, {
        as: "halaqoh",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.agenda_kelas, {
        as: "agenda_kelas",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.jadwal, {
        as: "jadwal",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.prestasi, {
        as: "guru",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.pelanggaran_siswa, {
        as: "pelaporan",
        foreignKey: "pelapor",
      });
      teacher.hasMany(models.pelanggaran_siswa, {
        as: "penindakan",
        foreignKey: "penindak",
      });
      teacher.hasMany(models.izin_pulang, {
        as: "pulang_approv_by",
        foreignKey: "approval_by",
      });
      teacher.hasMany(models.izin_pulang, {
        as: "laporan_oleh",
        foreignKey: "dilaporkan_oleh",
      });
      teacher.hasMany(models.penjengukan, {
        as: "kunjungan_approv_by",
        foreignKey: "approval_by",
      });
      teacher.hasMany(models.absensi_sholat, {
        as: "absensi_sholat",
        foreignKey: "created_by",
      });
      teacher.hasMany(models.guru_piket, {
        as: "guru_piket",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.laporan_guru_piket, {
        as: "dilaporkan",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.laporan_guru_piket, {
        as: "diperiksa",
        foreignKey: "diperiksa_oleh",
      });
      teacher.hasMany(models.pengampu_halaqoh, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      teacher.hasMany(models.pengampu_halaqoh, {
        as: "diabsen",
        foreignKey: "absen_by",
      });

      teacher.hasMany(models.bank_soal, {
        as: "bank_soal",
        foreignKey: "mapel_id",
      });
      teacher.hasMany(models.ujian, {
        as: "ujian",
        foreignKey: "mapel_id",
      });
      teacher.hasMany(models.tempat_pkl, {
        as: "tempat_pkl",
        foreignKey: "created_by",
      });
    }
  }
  teacher.init(
    {
      user_id: DataTypes.INTEGER,
      nama_guru: DataTypes.STRING,
      status: DataTypes.ENUM("active", "nonactive"),
      keterangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "teacher",
    }
  );
  return teacher;
};

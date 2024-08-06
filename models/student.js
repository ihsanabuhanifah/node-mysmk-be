"use strict";
const { Model } = require("sequelize");
const izin_pulang = require("./izin_pulang");
const penjengukan = require("./penjengukan");
module.exports = (sequelize, DataTypes) => {
  class student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      student.belongsTo(models.user),
        student.hasMany(models.parent, {
          as: "parent",
          foreignKey: "student_id",
        });
      student.hasMany(models.tempat_pkl, {
        as: "tempat_pkl",
        foreignKey: "student_id",
      });
      student.hasMany(models.kelas_student, {
        as: "kelas_student",
        foreignKey: "student_id",
      });
      student.hasMany(models.absensi_kelas, {
        as: "absensi_kelas",
        foreignKey: "student_id",
      });
      student.hasMany(models.absensi_halaqoh, {
        as: "absensi_halaqoh",
        foreignKey: "student_id",
      });

      student.hasMany(models.pelanggaran_siswa, {
        as: "pelanggaran",
        foreignKey: "student_id",
      });

      student.hasMany(models.prestasi, {
        as: "prestasi",
        foreignKey: "student_id",
      });
      student.hasMany(models.izin_pulang, {
        as: "izin_pulang",
        foreignKey: "student_id",
      });
      student.hasMany(models.penjengukan, {
        as: "penjengukan",
        foreignKey: "student_id",
      });
      student.hasMany(models.absensi_sholat, {
        as: "absensi_sholat",
        foreignKey: "student_id",
      });
      student.hasMany(models.hasil_belajar, {
        as: "hasil_belajar",
        foreignKey: "student_id",
      });
    }
  }
  student.init(
    {
      user_id: DataTypes.INTEGER,
      nama_siswa: DataTypes.STRING,
      nis: DataTypes.STRING,
      nisn: DataTypes.STRING,
      nik: DataTypes.STRING,
      tempat_lahir: DataTypes.STRING,
      tanggal_lahir: DataTypes.DATE,
      alamat: DataTypes.STRING,
      sekolah_asal: DataTypes.STRING,
      jenis_kelamin: DataTypes.STRING,
      anak_ke: DataTypes.INTEGER,
      tanggal_diterima: DataTypes.DATE,
      angkatan: DataTypes.STRING,
      tahun_ajaran: DataTypes.STRING,
      status: DataTypes.ENUM("active", "mutasi", "alumni"),
      keterangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "student",
    }
  );
  return student;
};

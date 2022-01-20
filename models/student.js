"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      student.belongsTo(models.user),
        student.hasMany(
          models.parent,
          { as: "parent" },
          { foreignKey: "studentId" }
        );
        student.hasMany(
          models.kelas_student,
          { as: "kelas_student" },
          { foreignKey: "studentId" }
        );
        student.hasMany(
          models.absensi_kelas,
          { as: "absensi_kelas" },
          { foreignKey: "studentId" }
        );
    }
    
  }
  student.init(
    {
      userId: DataTypes.INTEGER,
      namaSiswa: DataTypes.STRING,
      nis: DataTypes.STRING,
      nisn: DataTypes.STRING,
      nik: DataTypes.STRING,
      tempatLahir: DataTypes.STRING,
      tanggalLahir: DataTypes.DATE,
      alamat: DataTypes.STRING,
      sekolahAsal: DataTypes.STRING,
      jenisKelamin: DataTypes.STRING,
      anakKe: DataTypes.INTEGER,
      tanggalDiterima: DataTypes.DATE,
      angkatan: DataTypes.STRING,
      tahunAjaran: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "student",
    }
  );
  return student;
};

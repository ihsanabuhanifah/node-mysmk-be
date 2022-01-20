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
    },
    {
      sequelize,
      modelName: "student",
    }
  );
  return student;
};

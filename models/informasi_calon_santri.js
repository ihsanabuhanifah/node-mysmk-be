'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class informasi_calon_santri extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  informasi_calon_santri.init({
    user_id :DataTypes.INTEGER,
    nama_siswa: DataTypes.STRING,
    nis: DataTypes.STRING,
    nisn: DataTypes.STRING,
    nik: DataTypes.STRING,
    tempat_lahir: DataTypes.STRING,
    tanggal_lahir: DataTypes.STRING,
    alamat: DataTypes.STRING,
    sekolah_asal: DataTypes.STRING,
    jenis_kelamin: DataTypes.STRING,
    anak_ke: DataTypes.INTEGER,
    nama_ayah: DataTypes.STRING,
    nama_ibu: DataTypes.STRING,
    pekerjaan_ayah: DataTypes.STRING,
    pekerjaan_ibu: DataTypes.STRING,
    nama_wali: DataTypes.STRING,
    pekerjaan_wali: DataTypes.STRING,
    hubungan: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'informasi_calon_santri',
  });
  return informasi_calon_santri;
};
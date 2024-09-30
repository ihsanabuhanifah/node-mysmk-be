"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class informasi_calon_santri extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      informasi_calon_santri.belongsTo(models.user, { foreignKey: "user_id" });
      informasi_calon_santri.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });
    }
  }
  informasi_calon_santri.init(
    {
      user_id: DataTypes.INTEGER,
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
      kk: DataTypes.STRING,
      ijazah: DataTypes.STRING,
      akte: DataTypes.STRING,
      skb: DataTypes.STRING,
      surat_pernyataan: DataTypes.STRING,
      ta_id: DataTypes.INTEGER,
      exam: DataTypes.TEXT,
      status_ujian: {
        type: DataTypes.ENUM('Sudah', 'Belum'),
        allowNull: false,
        defaultValue: 'Belum',
      },
    },
    {
      sequelize,
      modelName: "informasi_calon_santri",
    }
  );
  return informasi_calon_santri;
};

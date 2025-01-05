  "use strict";
  const { Model } = require("sequelize");
  module.exports = (sequelize, DataTypes) => {
    class laporan_harian_pkl extends Model {
      /**
       * Helper method for defining associations.
       * This method is not a part of Sequelize lifecycle.
       * The `models/index` file will call this method automatically.
       */
      static associate(models) {
        // define association here
        laporan_harian_pkl.belongsTo(models.student, {
          as: "siswa",
          foreignKey: "student_id",
        });
        laporan_harian_pkl.hasMany(models.laporan_diniyyah_harian, {
          as: "laporan_diniyyah_harian",
          foreignKey: "laporan_harian_pkl_id",
        });
      }
    }
    laporan_harian_pkl.init(
      {
        judul_kegiatan: DataTypes.STRING,
        isi_laporan: DataTypes.TEXT,
        foto: DataTypes.STRING,
        is_absen: DataTypes.BOOLEAN,
        longtitude: DataTypes.DECIMAL(14, 10),
        latitude: DataTypes.DECIMAL(14, 10),
        tanggal: DataTypes.DATEONLY,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        status : DataTypes.ENUM('hadir', 'izin')
      },
      { 
        sequelize,
        modelName: "laporan_harian_pkl",
      }
    );
    return laporan_harian_pkl;
  };
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jawaban_tugas_pkl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      jawaban_tugas_pkl.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      jawaban_tugas_pkl.belongsTo(models.tugas_pkl, {
        as: "jawaban_tugas_pkl",
        foreignKey: "tugas_pkl_id",
      });
    }
  }
  jawaban_tugas_pkl.init(
    {
      link_jawaban: DataTypes.STRING,
      student_id: DataTypes.INTEGER,
      tugas_pkl_id: DataTypes.INTEGER,
      status: DataTypes.ENUM("selesai", "revisi", "gagal"),
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      tanggal: DataTypes.DATEONLY,
      pesan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "jawaban_tugas_pkl",
    }
  );
  return jawaban_tugas_pkl;
};

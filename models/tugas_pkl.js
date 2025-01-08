"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tugas_pkl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tugas_pkl.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      tugas_pkl.hasMany(models.jawaban_tugas_pkl, {
        as: "jawaban_tugas_pkl",
        foreignKey: "tugas_pkl_id",
      });
    }
  }
  tugas_pkl.init(
    {
      tugas: DataTypes.TEXT,
      teacher_id: DataTypes.INTEGER,
      link_soal: DataTypes.STRING,
      batas_waktu: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      tanggal: DataTypes.DATEONLY,
      deskripsi_tugas: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tugas_pkl",
    }
  );
  return tugas_pkl;
};

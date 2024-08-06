"use strict";
const Datatype = require("faker/lib/datatype");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tempat_pkl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tempat_pkl.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      tempat_pkl.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "created_by",
      });
    }
  }
  tempat_pkl.init(
    {
      nama_perusahaan: DataTypes.STRING,
      kota: DataTypes.STRING,
      kecamatan: DataTypes.STRING,
      alamat: DataTypes.TEXT,
      provinsi: DataTypes.STRING,
      desa: DataTypes.STRING,
      rt: DataTypes.STRING,
      rw: DataTypes.STRING,
      no_hp: DataTypes.STRING,
      kode_pos: DataTypes.INTEGER,
      penanggung_jawab_perusahaan: DataTypes.STRING,
      penanggung_jawab_sekolah: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      created_at : DataTypes.DATE,
      updated_at : DataTypes.DATE,
      long : DataTypes.DECIMAL(10, 8),
      latitude : DataTypes.DECIMAL(10, 8)
    },
    {
      sequelize,
      modelName: "tempat_pkl",
      tableName : "tempat_pkl"
    }
  );
  return tempat_pkl;
};

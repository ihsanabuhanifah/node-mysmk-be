"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class nilai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

     
      nilai.belongsTo(models.student, {
        as: "siswa",
        foreignKey: "student_id",
      });
      nilai.belongsTo(models.kelas, {
        as: "kelas",
        foreignKey: "kelas_id",
      });
      nilai.belongsTo(models.mapel, {
        as: "mapel",
        foreignKey: "mapel_id",
      });

      nilai.belongsTo(models.teacher, {
        as: "teacher",
        foreignKey: "teacher_id",
      });
      nilai.belongsTo(models.ujian, {
        as: "ujian",
        foreignKey: "ujian_id",
      });
      nilai.belongsTo(models.ta, {
        as: "tahun_ajaran",
        foreignKey: "ta_id",
      });

    }
  }
  nilai.init(
    {
      ujian_id: DataTypes.INTEGER,
      ta_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
      mapel_id: DataTypes.INTEGER,
      jenis_ujian: DataTypes.STRING,
      student_id: DataTypes.INTEGER,
      kelas_id: DataTypes.INTEGER,
      jawaban: DataTypes.TEXT,
      waktu_tersisa: DataTypes.INTEGER,
      jam_mulai: DataTypes.DATE,
      jam_selesai: DataTypes.DATE,
      jam_submit: DataTypes.DATE,
      jam_progress: DataTypes.DATE,
      keterangan: DataTypes.STRING,
      upload_file: DataTypes.STRING,
      remidial_count : DataTypes.INTEGER,
      exam: DataTypes.STRING,
      urutan : DataTypes.INTEGER,
      is_lulus : DataTypes.INTEGER,
      exam_result: DataTypes.DECIMAL(5, 2),
      refresh_count: DataTypes.INTEGER,
      status: DataTypes.ENUM('finish', 'open', 'progress', 'locked'),
    },
    {
      sequelize,
      modelName: "nilai",
    }
  );
  return nilai;
};
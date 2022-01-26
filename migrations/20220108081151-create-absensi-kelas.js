"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("absensi_kelas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tanggal: {
        type: Sequelize.DATE,
      },
      teacher_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      student_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "students",
          key: "id",
          as: "student_id",
        },
      },
      kelas_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "kelas",
          key: "id",
          as: "kelas_id",
        },
      },
      mapel_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "mapels",
          key: "id",
          as: "mapel_id",
        },
      },
      pelajaran_ke: {
        type: Sequelize.INTEGER,
      },
      materi: {
        type: Sequelize.STRING,
      },
      status_kehadiran: {
        type: Sequelize.INTEGER,
      },
      keterangan: {
        type: Sequelize.STRING,
      },
      
      semester: {
        type: Sequelize.INTEGER,
      },
      ta_id: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("absensi_kelas");
  },
};

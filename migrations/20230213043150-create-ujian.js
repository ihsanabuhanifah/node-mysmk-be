"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ujians", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      jenis_ujian: {
        type: Sequelize.STRING,
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
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      soal: {
        type: Sequelize.TEXT,
      },
      waktu_mulai: {
        type: Sequelize.DATE,
      },
      waktu_selesai: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      student_access: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("ujians");
  },
};

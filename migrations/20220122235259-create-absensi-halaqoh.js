'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('absensi_halaqohs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      teacher_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      tanggal: {
        type: Sequelize.DATEONLY
      },
      dari_surat: {
        type: Sequelize.STRING
      },
      sampai_surat: {
        type: Sequelize.STRING
      },
      dari_ayat: {
        type: Sequelize.STRING
      },
      sampai_ayat: {
        type: Sequelize.STRING
      },
      total_halaman: {
        type: Sequelize.STRING
      },
      status_kehadiran: {
        type: Sequelize.INTEGER
      },
      keterangan: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('absensi_halaqohs');
  }
};
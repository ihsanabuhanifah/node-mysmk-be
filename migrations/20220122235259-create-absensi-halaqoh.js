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
        type: Sequelize.INTEGER
      },
      sampai_surat: {
        type: Sequelize.INTEGER
      },
      dari_ayat: {
        type: Sequelize.INTEGER
      },
      sampai_ayat: {
        type: Sequelize.INTEGER
      },
      halaman_terakhir: {
        type: Sequelize.INTEGER
      },
      status_kehadiran: {
        type: Sequelize.INTEGER
      },
      keterangan: {
        type: Sequelize.STRING
      },
      semester: {
        type: Sequelize.INTEGER,
      },
      tahun_ajaran: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('absensi_halaqohs');
  }
};
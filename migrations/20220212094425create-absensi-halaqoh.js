"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("absensi_halaqohs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      halaqoh_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      tanggal: {
        type: Sequelize.DATEONLY,
      },
      dari_surat: {
        type: Sequelize.INTEGER,
      },
      sampai_surat: {
        type: Sequelize.INTEGER,
      },
      dari_ayat: {
        type: Sequelize.INTEGER,
      },
      sampai_ayat: {
        type: Sequelize.INTEGER,
      },

      total_halaman: {
        type: Sequelize.DECIMAL(3,1),
      },
      
      juz_ke: {
        type: Sequelize.INTEGER,
      },
      ketuntasan_juz: {
        type: Sequelize.INTEGER,
        defaultValue : 0,
      },
      status_kehadiran: {
        type: Sequelize.INTEGER,
      },
      keterangan: {
        type: Sequelize.STRING,
      },
      kegiatan : {
        type : Sequelize.INTEGER,
      },
      
      waktu : {
        type : Sequelize.STRING,
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
    await queryInterface.dropTable("absensi_halaqohs");
  },
};

"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("laporan_diniyyah_harians", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
      tanggal: {
        allowNull: false,
        type: Sequelize.DATEONLY,
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
      laporan_harian_pkl_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "laporan_harian_pkls",
          key: "id",
          as: "laporan_harian_pkl_id",
        },
      },
      dzikir_pagi: {
        allowNull: true,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      dzikir_petang: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      },
      dari_surat: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sampai_surat: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      dari_ayat: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      sampai_ayat: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      sholat_shubuh: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sholat_dzuhur: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sholat_ashar: {
        allowNull: true,
        
        type: Sequelize.STRING,
      },
      sholat_magrib: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sholat_isya: {
        allowNull: true,
        type: Sequelize.STRING,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("laporan_diniyyah_harians");
  },
};

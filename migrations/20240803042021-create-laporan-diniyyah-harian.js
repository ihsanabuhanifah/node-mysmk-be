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
      dzikir_pagi: {
        type: Sequelize.BOOLEAN,
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
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      dzikir_petang: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      },
      dari_surat: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      sampai_surat: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      dari_ayat: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sampai_ayat: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      sholat_shubuh: {
        allowNull: false,
        type: Sequelize.ENUM("berjamaah", "sendirian", "tidak solat"),
      },
      sholat_dzuhur: {
        allowNull: false,
        type: Sequelize.ENUM("berjamaah", "sendirian", "tidak solat"),
      },
      sholat_ashar: {
        allowNull: false,
        type: Sequelize.ENUM("berjamaah", "sendirian", "tidak solat"),
      },
      sholat_magrib: {
        allowNull: false,
        type: Sequelize.ENUM("berjamaah", "sendirian", "tidak solat"),
      },
      sholat_isya: {
        allowNull: false,
        type: Sequelize.ENUM("berjamaah", "sendirian", "tidak solat"),
      },
      
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("laporan_diniyyah_harians");
  },
};

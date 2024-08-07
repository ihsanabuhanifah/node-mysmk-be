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
        type: Sequelize.BOOLEAN,
      },
      dzikir_petang: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      sholat_shubuh: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      sholat_dzuhur: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      sholat_ashar: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      sholat_magrib: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      sholat_isya: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("laporan_diniyyah_harians");
  },
};

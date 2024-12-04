"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("laporan_harian_pkls", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      judul_kegiatan: {
        allowNull: false,

        type: Sequelize.STRING,
      },
      isi_laporan: {
        allowNull: false,

        type: Sequelize.STRING,
      },
      foto: {
        allowNull: false,

        type: Sequelize.STRING,
      },
      is_absen: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      tanggal: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
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
      longtitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(14, 10),
      },
      latitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(14, 10),
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("hadir", "izin"),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("laporan_harian_pkls");
  },
};

"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("absensi_sholats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "RESTRICT",
        references: {
          model: "students",
          key: "id",
          as: "student_id",
        },
      },
      tanggal: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      waktu: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      keterangan: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      alasan: {
        type: Sequelize.STRING,
      },
      created_by: {
        type: Sequelize.INTEGER,

        onDelete: "RESTRICT",
        references: {
          model: "teachers",
          key: "id",
          as: "created_by",
        },
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
    await queryInterface.dropTable("absensi_sholats");
  },
};

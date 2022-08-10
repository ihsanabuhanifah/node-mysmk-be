"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("pengampu_halaqohs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tanggal: {
        type: Sequelize.DATEONLY,
      },
      halaqoh_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "halaqohs",
          key: "id",
          as: "halaqoh_id",
        },
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      status_kehadiran: {
        type: Sequelize.INTEGER,
      },
      ta_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "ta",
          key: "id",
          as: "ta_id",
        },
      },
      status: {
        type: Sequelize.INTEGER,
      },
      keterangan: {
        type: Sequelize.STRING,
      },
      waktu: {
        type: Sequelize.STRING,
      },
      absen_by: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "teachers",
          key: "id",
          as: "absen_by",
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
    await queryInterface.dropTable("pengampu_halaqohs");
  },
};

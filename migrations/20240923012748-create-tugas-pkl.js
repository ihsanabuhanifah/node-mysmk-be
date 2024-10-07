"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tugas_pkls", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tugas: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      deskripsi_tugas: {
        allowNull: false,
        type: Sequelize.STRING,
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
      link_soal: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      batas_waktu: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher",
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tugas_pkls");
  },
};

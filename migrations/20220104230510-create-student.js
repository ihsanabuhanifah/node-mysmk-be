"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Students", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "userId",
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nis: {
        type: Sequelize.STRING,
      },
      nisn: {
        type: Sequelize.STRING,
      },
      nik: {
        type: Sequelize.STRING,
      },
      tempatLahir: {
        type: Sequelize.STRING,
      },
      tanggalLahir: {
        type: Sequelize.DATE,
      },

      alamat: {
        type: Sequelize.STRING,
      },
      sekolahAsal: {
        type: Sequelize.STRING,
      },
      jenisKelamin: {
        type: Sequelize.STRING,
      },
      anakKe: {
        type: Sequelize.INTEGER,
      },
      tanggalDiterima: {
        type: Sequelize.DATE,
      },
      angkatan: {
        type: Sequelize.STRING,
      },
      tahunAjaran: {
        type: Sequelize.STRING,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Students");
  },
};

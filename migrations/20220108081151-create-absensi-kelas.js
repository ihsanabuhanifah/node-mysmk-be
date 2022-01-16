"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("AbsensiKelas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.DATE,
      },
      StudentId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Student",
          key: "id",
          as: "StudentId",
        },
      },
      KelasId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Kelas",
          key: "id",
          as: "KelasId",
        },
      },
      MapelId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Maple",
          key: "id",
          as: "MapelId",
        },
      },
      materi: {
        type: Sequelize.STRING,
      },
      alasan: {
        type: Sequelize.STRING,
      },
      keterangan: {
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
    await queryInterface.dropTable("AbsensiKelas");
  },
};

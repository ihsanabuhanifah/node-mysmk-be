"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("KelasStudents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      StudentId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Students",
          key: "id",
          as: "StudentId",
        },
      },
      semester: {
        type: Sequelize.INTEGER,
      },
      tahunAjaran: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("KelasStudents");
  },
};

"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("halaqohs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama_kelompok: {
        type: Sequelize.STRING,
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      semester: {
        type: Sequelize.INTEGER,
      },
      ta_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "ta",
          key: "id",
          as: "ta_id",
        },
      },
      status: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("halaqohs");
  },
};

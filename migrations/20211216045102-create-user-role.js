"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_roles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "users",
          key: "id",
          as: "userId",
        },
      },
      roleId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "roles",
          key: "id",
          as: "roleId",
        },
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
    await queryInterface.dropTable("user_roles");
  },
};

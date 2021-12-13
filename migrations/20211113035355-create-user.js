"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      email_verified: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue : false
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      image: {
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "inactive",
      },
      refreshToken: {
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
    await queryInterface.dropTable("Users");
  },
};

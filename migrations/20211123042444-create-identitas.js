'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Identitas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        unique : true,
        onDelete: "CASCADE",
        references: {
          model: "Users",
          key: "id",
          as: "userId",
        },
      },
      tempatLahir: {
        allowNull : false,
        type: Sequelize.STRING
      },
      tanggalLahir: {
        type: Sequelize.DATEONLY
      },
      jenisKelamin: {
        allowNull : false,
        type: Sequelize.INTEGER
      },
      alamat: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Identitas');
  }
};
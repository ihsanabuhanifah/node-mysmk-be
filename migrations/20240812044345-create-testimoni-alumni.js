'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('testimoni_alumnis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      testimoni: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      pekerjaan_sekarang: {
        type: Sequelize.STRING
      },
      jurusan: {
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
    await queryInterface.dropTable('testimoni_alumnis');
  }
};
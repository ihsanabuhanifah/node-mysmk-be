'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('konfigurasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      namaSekolah: {
        type: Sequelize.STRING
      },
      namaKepalaSekeolah: {
        type: Sequelize.STRING
      },
      npsn: {
        type: Sequelize.MEDIUMINT
      },
      semesterAktif: {
        type: Sequelize.TINYINT
      },
      tahunAjaranAktif: {
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
    await queryInterface.dropTable('konfigurasis');
  }
};
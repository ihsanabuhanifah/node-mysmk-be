'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("parents", "no_hp", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("parents", "nama_siswa", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("parents", "nisn", {
      type: Sequelize.STRING,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("parents", "no_hp", {});
    await queryInterface.removeColumn("parents", "nama_siswa", {});
    await queryInterface.removeColumn("parents", "nisn", {});
  }
};

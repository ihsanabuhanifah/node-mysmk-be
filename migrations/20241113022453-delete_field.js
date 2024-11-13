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

    await queryInterface.removeColumn('pembayaran_spps', 'tanggal_konfirmasi');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.addColumn('pembayaran_spps', 'tanggal_konfirmasi', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    })
  }
};

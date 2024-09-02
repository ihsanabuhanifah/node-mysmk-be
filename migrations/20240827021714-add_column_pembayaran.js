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

    await queryInterface.addColumn("pembayaran_spps", "token_bayar", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("pembayaran_spps", "keterangan", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("pembayaran_spps", "transaksi_id", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("pembayaran_spps", "status_midtrans", {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

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

    await queryInterface.addColumn("pembayaran_spps", "transaction_id", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("pembayaran_spps", "redirect_url", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("pembayaran_spps", "transaction_token", {
      type: Sequelize.STRING
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("pembayaran_spps", "transaksi_id", {});
    await queryInterface.removeColumn("pembayaran_spps", "token_bayar", {});
  }
};

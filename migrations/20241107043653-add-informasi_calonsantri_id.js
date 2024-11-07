'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pembayaran_ppdbs', 'informasi_calon_santri_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if it's required
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pembayaran_ppdbs', 'informasi_calon_santri_id');
  },
};

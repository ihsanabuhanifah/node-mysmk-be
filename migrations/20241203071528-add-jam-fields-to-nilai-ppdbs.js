"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("nilai_ppdbs", "jam_mulai", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("nilai_ppdbs", "jam_selesai", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("nilai_ppdbs", "jam_submit", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("nilai_ppdbs", "jam_progress", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("nilai_ppdbs", "jam_mulai");
    await queryInterface.removeColumn("nilai_ppdbs", "jam_selesai");
    await queryInterface.removeColumn("nilai_ppdbs", "jam_submit");
    await queryInterface.removeColumn("nilai_ppdbs", "jam_progress");
  },
};

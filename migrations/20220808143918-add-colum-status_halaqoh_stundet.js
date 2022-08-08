"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     
     */

    await queryInterface.addColumn("halaqoh_students", "status", {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     *  await queryInterface.addColumn('halaqoh_students' ,'status', { type: Sequelize.INTEGER });
     */

    await queryInterface.removeColumn("halaqoh_students", "status", {});
  },
};

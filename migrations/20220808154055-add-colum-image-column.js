"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("teachers", "image", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("students", "image", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("parents", "image", {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("teachers", "image", {});
    await queryInterface.removeColumn("students", "image", {});
    await queryInterface.removeColumn("parents", "image", {});

    
  },
};

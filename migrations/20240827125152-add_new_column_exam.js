"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

   
    await queryInterface.addColumn("hasil_belajars", "rata_nilai_projek", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("nilais", "urutan", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("ujians", "urutan", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addColumn("nilais", "is_Lulus", {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface, Sequelize) {
   
    await queryInterface.removeColumn("hasil_belajars", "rata_nilai_projek", {});
    await queryInterface.removeColumn("nilais", "urutan", {});
    await queryInterface.removeColumn("ujians", "urutan", {});
    await queryInterface.removeColumn("nilais", "is_lulus", {});
    
    /**
     *  await queryInterface.removeColumn("nilai", "rata_nilai_projek", {});
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

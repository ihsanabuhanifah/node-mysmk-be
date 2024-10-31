"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("wawancaras", "tanggal", {
      type: Sequelize.DATEONLY, // Ganti tipe data menjadi DATEONLY
      allowNull: false, // Sesuaikan jika perlu
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("wawancaras", "tanggal", {
      type: Sequelize.DATE, // Kembalikan tipe data ke DATE jika migrasi dibatalkan
      allowNull: false, // Sesuaikan jika perlu
    });
  },
};

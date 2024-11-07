"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Tambah kolom baru ke tabel
    await queryInterface.addColumn("wawancaras", "informasi_calon_santri_id", {
      type: Sequelize.INTEGER,
      onDelete: "CASCADE", // Sesuaikan dengan tipe data kolom yang sesuai
      references: {
        model: "informasi_calon_santris", // Nama tabel yang direferensikan
        key: "id",
        as: "calon_santri_id", // Primary key di tabel yang direferensikan
      }, // Atur apakah kolom bisa bernilai null atau tidak
    });
  },

  down: async (queryInterface, Sequelize) => {},
};

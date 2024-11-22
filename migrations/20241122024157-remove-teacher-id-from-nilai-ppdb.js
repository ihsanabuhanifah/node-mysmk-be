"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hapus kolom `teacher_id` dari tabel `nilai_ppdb`
    await queryInterface.removeColumn("nilai_ppdbs", "teacher_id");
  },

  async down(queryInterface, Sequelize) {},
};

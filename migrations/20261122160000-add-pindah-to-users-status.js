'use strict';

// Menambah nilai 'pindah' (siswa pindah sekolah, akun diblokir) ke enum users.status.
// Nilai ditambahkan di akhir enum sehingga data lama tidak berubah.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'pindah'),
      allowNull: false,
      defaultValue: 'inactive',
    });
  },

  async down(queryInterface, Sequelize) {
    // Kembalikan akun 'pindah' ke 'inactive' sebelum menghapus nilai enum
    await queryInterface.sequelize.query(
      "UPDATE users SET status = 'inactive' WHERE status = 'pindah'"
    );
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'inactive',
    });
  },
};

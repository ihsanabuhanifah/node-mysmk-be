'use strict';

// Menambah nilai 'diblokir' (akun dinonaktifkan admin, mis. guru nonaktif) ke enum users.status.
// Ditambahkan di akhir enum sehingga data lama tidak berubah.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'pindah', 'diblokir'),
      allowNull: false,
      defaultValue: 'inactive',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE users SET status = 'inactive' WHERE status = 'diblokir'"
    );
    await queryInterface.changeColumn('users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'pindah'),
      allowNull: false,
      defaultValue: 'inactive',
    });
  },
};

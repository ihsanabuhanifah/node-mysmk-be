'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('riwayat_kelas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'students', key: 'id' },
      },
      // pindah = pindah kelas di semester yang sama
      // semester_baru = naik kelas / pindah karena tahun ajaran / semester baru
      // nonaktif = dinonaktifkan dari kelas (lulus / keluar)
      jenis: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      dari_kelas_id: { type: Sequelize.INTEGER, allowNull: true },
      dari_ta_id: { type: Sequelize.INTEGER, allowNull: true },
      dari_semester: { type: Sequelize.INTEGER, allowNull: true },
      ke_kelas_id: { type: Sequelize.INTEGER, allowNull: true },
      ke_ta_id: { type: Sequelize.INTEGER, allowNull: true },
      ke_semester: { type: Sequelize.INTEGER, allowNull: true },
      keterangan: { type: Sequelize.STRING, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('riwayat_kelas', ['student_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('riwayat_kelas');
  },
};

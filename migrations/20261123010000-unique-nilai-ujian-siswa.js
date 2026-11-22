'use strict';

// Satu siswa hanya boleh punya satu baris nilai per ujian (cegah baris ganda
// akibat "buka ujian" diklik dua kali / retry).
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('nilais', ['ujian_id', 'student_id'], {
      unique: true,
      name: 'uniq_nilai_ujian_siswa',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('nilais', 'uniq_nilai_ujian_siswa');
  },
};

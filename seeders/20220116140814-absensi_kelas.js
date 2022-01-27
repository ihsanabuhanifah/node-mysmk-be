"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "absensi_kelas",
      [
        {
          tanggal: "2022-01-17",
          teacher_id: 2,
          student_id: 1,
          kelas_id: 1,
          mapel_id: 2,
          status_kehadiran: 1,
          keterangan: "",
          semester: 1,
          ta_id : 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 1,
          student_id: 1,
          kelas_id: 1,
          mapel_id: 1,
          status_kehadiran: 1,
          keterangan: "",
          semester: 1,
          ta_id : 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 1,
          student_id: 1,
          kelas_id: 1,
          mapel_id: 1,
          status_kehadiran: 1,
          keterangan: "",
          semester: 1,
          ta_id : 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 3,
          student_id: 1,
          kelas_id: 1,
          mapel_id: 3,
          status_kehadiran: 1,
          keterangan: "",
          semester: 1,
          ta_id : 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-19",
          teacher_id: 3,
          student_id: 1,
          kelas_id: 1,
          mapel_id: 3,
          status_kehadiran: 1,
          keterangan: "",
          semester: 1,
          ta_id : 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-19",
          teacher_id: 3,
          student_id: 1,
          kelas_id: 1,
          mapel_id: 3,
          status_kehadiran: 2,
          keterangan: "",
          semester: 1,
          ta_id : 8,
          created_at: new Date(),
          updated_at: new Date(),
        },

       
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("absensi_kelas", null, {});
  },
};

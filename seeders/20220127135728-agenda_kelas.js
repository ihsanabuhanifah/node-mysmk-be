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
      "agenda_kelas",
      [
        {
          tanggal: "2022-01-17",
          teacher_id: 2,

          kelas_id: 1,
          mapel_id: 2,
          jam_ke: 1,
          materi: "aaa",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 2,

          kelas_id: 1,
          mapel_id: 2,
          jam_ke: 2,
          materi: "bbbb",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 3,
          materi: "cccc",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 4,
          materi: "ddd",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 5,
          materi: "eeeeeee",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 6,
          materi: "fffff",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-17",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 7,
          materi: "gggg",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 1,
          materi: "aaaaa",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 2,
          materi: "bbbbb",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 1,

          kelas_id: 1,
          mapel_id: 1,
          jam_ke: 3,
          materi: "eeeeee",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 3,

          kelas_id: 1,
          mapel_id: 3,
          jam_ke: 4,
          materi: "ddd",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 3,

          kelas_id: 1,
          mapel_id: 3,
          jam_ke: 5,
          materi: "eeeee",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 3,

          kelas_id: 1,
          mapel_id: 3,
          jam_ke: 6,
          materi: "ffff",
         
          semester: 1,
          ta_id: 8,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          tanggal: "2022-01-18",
          teacher_id: 3,

          kelas_id: 1,
          mapel_id: 3,
          jam_ke: 7,
          materi: "ggg",
         
          semester: 1,
          ta_id: 8,
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

    await queryInterface.bulkDelete("agenda_kelas", null, {});
  },
};

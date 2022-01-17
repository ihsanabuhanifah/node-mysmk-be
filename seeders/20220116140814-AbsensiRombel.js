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
      "AbsensiKelas",
      [
        {
          tanggal: "2022-01-17",
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          alasan: 1,
          keterangan: "sakit kepala ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-17",
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          alasan: 1,
          keterangan: "sakit kepala ",

          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-17",
          StudentId: 2,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          alasan: 1,
          keterangan: "sakit kepala ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-17",
          StudentId: 3,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          alasan: 1,
          keterangan: "sakit kepala ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
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

    await queryInterface.bulkDelete("AbsensiKelas", null, {});
  },
};

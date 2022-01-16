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
          date: "2022-01-17",
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
          date: "2022-01-17",
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
          date: "2022-01-17",
          StudentId: 2,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          alasan: 1,
          keterangan: "sakit kepala ",

          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          date: "2022-01-17",
          StudentId: 3,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          alasan: 1,
          keterangan: "sakit kepala ",

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

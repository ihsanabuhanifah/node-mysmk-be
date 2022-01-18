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
          TeacherId: 2,
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 1,
          statusKehadiran: 1,
          keterangan: "",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-17",
          TeacherId: 1,
          StudentId: 1,
          KelasId: 1,
          MapelId: 1,
          materi: "Perulangan",
          pelajaranKe: 2,
          statusKehadiran: 2,
          keterangan: "sakit kepala ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-17",
          TeacherId: 2,
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 3,
          statusKehadiran: 2,
          keterangan: "sakit pinggang ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-17",
          TeacherId: 3,
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 4,
          statusKehadiran: 2,
          keterangan: "sakit kepala ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-01-18",
          TeacherId: 3,
          StudentId: 2,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 1,
          statusKehadiran: 1,
          keterangan: "sakit kepala ",
          semester: 1,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-08-18",
          TeacherId: 2,
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 2,
          statusKehadiran: 1,
          keterangan: "sakit kepala ",
          semester: 2,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2022-08-18",
          TeacherId: 1,
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 3,
          statusKehadiran: 2,
          keterangan: "sakit kepala ",
          semester: 2,
          tahunAjaran: "2021/2022",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          tanggal: "2023-01-17",
          TeacherId: 1,
          StudentId: 1,
          KelasId: 1,
          MapelId: 9,
          materi: "Perulangan",
          pelajaranKe: 1,
          statusKehadiran: 1,
          keterangan: " ",
          semester: 2,
          tahunAjaran: "2022/2023",
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

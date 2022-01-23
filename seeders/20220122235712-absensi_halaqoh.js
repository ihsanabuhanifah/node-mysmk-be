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
     *
     */

    await queryInterface.bulkInsert(
      "absensi_halaqohs",
      [
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-01-24",
          dari_surat: 114,
          dari_ayat: 1,
          sampai_surat: 109,
          sampai_ayat: 6,
          halaman_terakhir: 603,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-01-25",
          dari_surat: 108,
          dari_ayat: 1,
          sampai_surat: 104,
          sampai_ayat: 3,
          halaman_terakhir: 601,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-01-26",
          dari_surat: 103,
          dari_ayat: 1,
          sampai_surat: 97,
          sampai_ayat: 5,
          halaman_terakhir: 598,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-01-27",
          dari_surat: 96,
          dari_ayat: 1,
          sampai_surat: 94,
          sampai_ayat: 8,
          halaman_terakhir: 596,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-01-28",
          dari_surat:null ,
          dari_ayat: null,
          sampai_surat: null,
          sampai_ayat: null,
          halaman_terakhir: 596,
          status_kehadiran: 2,
          keterangan: "sakit perut",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-01-31",
          dari_surat: 93,
          dari_ayat: 1,
          sampai_surat: 90,
          sampai_ayat: 20,
          halaman_terakhir: 594,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-02-01",
          dari_surat: 93,
          dari_ayat: 1,
          sampai_surat: 90,
          sampai_ayat: 20,
          halaman_terakhir: 594,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-02-02",
          dari_surat: 89,
          dari_ayat: 1,
          sampai_surat: 89,
          sampai_ayat: 30,
          halaman_terakhir: 593,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-02-03",
          dari_surat: 88,
          dari_ayat: 1,
          sampai_surat: 86,
          sampai_ayat: 17,
          halaman_terakhir: 591,
          status_kehadiran: 1,
          keterangan: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          student_id: 1,
          teacher_id: 5,
          tanggal: "2022-02-03",
          dari_surat: 85,
          dari_ayat: 1,
          sampai_surat: 84,
          sampai_ayat: 25,
          halaman_terakhir: 589,
          status_kehadiran: 1,
          keterangan: "",
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

    await queryInterface.bulkDelete("absensi_halaqohs", null, {});
  },
};

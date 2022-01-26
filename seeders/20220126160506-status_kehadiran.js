"use strict";

const { ContextHandlerImpl } = require("express-validator/src/chain");

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
      "status_kehadirans",
      [
        {
          id : 1,
          nama_status_kehadiran: "hadir",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id : 2,
          nama_status_kehadiran: "sakit",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id : 3,
          nama_status_kehadiran: "izin pulang",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id : 4,
          nama_status_kehadiran: "dispensasi",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id : 5,
          nama_status_kehadiran: "tanpa keterangan",
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

    await queryInterface.bulkDelete("status_kehadirans", null, {});
  },
};

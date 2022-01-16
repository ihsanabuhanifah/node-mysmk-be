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
      "KelasStudents",
      [
        {
          KelasId: 1,
          StudentId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          KelasId: 1,
          StudentId: 2,
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
     * await queryInterface.bulkDelete('KelasStudents', null, {});
     */
    await queryInterface.bulkDelete("KelasStudents", null, {});
  },
};

// function generateFakerItems(rowCount) {
//   const data = [];
//   for (let i = 0; i < rowCount; i++) {
//     const newItem = {
//       userId : faker.random.number(),
//       titile: faker.name.findName(),
//       email: faker.internet.email(),
//       password: "`12345678",
//       status: "active",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     data.push(newItem);
//   }

//   return data;
// }

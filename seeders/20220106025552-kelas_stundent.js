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
      "kelas_students",
      [
        {
          kelas_id: 1,
          student_id: 1,
          semester: 1,
          ta_id: 8,
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          kelas_id: 2,
          student_id: 2,
          semester: 1,
          ta_id: 8,
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          kelas_id: 3,
          student_id: 3,
          semester: 1,
          ta_id: 8,
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          kelas_id: 4,
          student_id: 4,
          semester: 1,
          ta_id: 8,
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          kelas_id: 5,
          student_id: 5,
          semester: 1,
          ta_id: 8,
          status: 1,
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
     * await queryInterface.bulkDelete('KelasStudents', null, {});
     */
    await queryInterface.bulkDelete("kelas_students", null, {});
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
//       updated_at: new Date(),
//     };

//     data.push(newItem);
//   }

//   return data;
// }

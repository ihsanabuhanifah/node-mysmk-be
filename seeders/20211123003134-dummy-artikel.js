'use strict';
const faker = require("faker");
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
     const items = generateFakerItems(100);
     await queryInterface.bulkInsert("artikels", items, {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete("atrikels", null, {});
  }
};


function generateFakerItems(rowCount) {
  const data = [];
  for (let i = 0; i < rowCount; i++) {
    const newItem = {
      userId : faker.random.number(),
      titile: faker.name.findName(),
      email: faker.internet.email(),
      password: "`12345678",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    data.push(newItem);
  }

  return data;
}




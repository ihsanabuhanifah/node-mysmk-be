"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("kelas_students", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kelas_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "kelas",
          key: "id",
          as: "kelas_id",
        },
      },
      student_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "students",
          key: "id",
          as: "student_id",
        },
      },
      semester: {
        type: Sequelize.INTEGER,
      },
      ta_id: {
        type: Sequelize.INTEGER,
        

      },
      status: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("kelas_students");
  },
};

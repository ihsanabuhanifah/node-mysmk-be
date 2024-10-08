'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prestasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal: {
        type: Sequelize.DATE
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "students",
          key: "id",
          as: "student_id",
        },
      },
      prestasi: {
        type: Sequelize.STRING
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      kategori: {
        type: Sequelize.STRING
      },
      semester: {
        type: Sequelize.INTEGER
      },
      ta_id: {
        type: Sequelize.INTEGER
      },
      file_url: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('prestasis');
  }
};
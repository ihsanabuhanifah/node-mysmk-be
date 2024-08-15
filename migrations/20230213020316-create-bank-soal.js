'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bank_soals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      materi: {
        type: Sequelize.STRING
      },
      mapel_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "mapels",
          key: "id",
          as: "mapel_id",
        },
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },
      file: {
        type: Sequelize.STRING
      },
      tipe: {
        type: Sequelize.STRING
      },
      soal: {
        type: Sequelize.TEXT
      },
      jawaban : {
        type : Sequelize.STRING
      },
      point : {
        type : Sequelize.INTEGER
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
    await queryInterface.dropTable('bank_soals');
  }
};
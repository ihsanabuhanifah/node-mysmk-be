'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pelanggaran_siswas', {
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
        onDelete: "CASCADE",
        references: {
          model: "students",
          key: "id",
          as: "student_id",
        },
      },
      pelapor: {
        type: Sequelize.INTEGER,
        references: {
          model: "teachers",
          key: "id",
          as: "pelapor",
        },
      },
      pelanggaran_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "pelanggarans",
          key: "id",
          as: "pelanggaran_id",
        },
      },
      status: {
        type: Sequelize.INTEGER
      },
      tindakan: {
        type: Sequelize.STRING
      },
      penindak: {
        type: Sequelize.INTEGER,
        references: {
          model: "teachers",
          key: "id",
          as: "penindak",
        },
      },
      semester: {
        type: Sequelize.INTEGER
      },
      ta_id: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('pelanggaran_siswas');
  }
};
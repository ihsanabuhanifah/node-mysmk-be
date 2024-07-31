'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hasil_belajars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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

      mapel_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "mapels",
          key: "id",
          as: "mapel_id",
        },
      },

      presentasi_tugas: {
        type: Sequelize.INTEGER,
      },
      presentasi_harian: {
        type: Sequelize.INTEGER,
      },
      presentasi_pts : {
        type: Sequelize.INTEGER,
      },
      presentasi_pas : {
        type: Sequelize.INTEGER,
      },
      presentasi_us : {
        type: Sequelize.INTEGER,
      },
      presentasi_kehadiran : {
        type: Sequelize.INTEGER,
      },
      nilai: {
        type: Sequelize.INTEGER
      },
      deskripsi: {
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hasil_belajars');
  }
};
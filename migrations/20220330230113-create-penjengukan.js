'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('penjengukans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "users",
          key: "id",
          as: "user_id",
        },
      },
      student_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "students",
          key: "id",
          as: "student_id",
        },
      },
      tanggal: {
        type: Sequelize.DATE,
        allowNull:false
      },
      kepentingan: {
        type: Sequelize.STRING,
        allowNull:false
      },
      status_approval: {
        type: Sequelize.ENUM('menunggu', 'disetujui', 'ditolak')
      },
      approval_by: {
        type: Sequelize.INTEGER,
       
        onDelete: "RESTRICT",
        references: {
          model: "teachers",
          key: "id",
          as: "approval_by",
        },
      },
      alasan_ditolak: {
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
    await queryInterface.dropTable('penjengukans');
  }
};
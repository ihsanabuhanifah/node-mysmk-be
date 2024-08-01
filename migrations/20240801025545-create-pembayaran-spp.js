'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pembayaran_spps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "users",
          key: "id",
          as: "user_id"
        }
      },
      walsan_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "parents",
          key: "id",
          as: "walsan_id"
        }
      },
      tgl: {
        type: Sequelize.DATE
      },
      foto: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      bulan: {
        type: Sequelize.STRING
      },
      tahun: {
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pembayaran_spps');
  }
};
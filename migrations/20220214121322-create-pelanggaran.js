'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pelanggarans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama: {
        type: Sequelize.STRING
      },
      tipe_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "tipe_pelanggarans",
          key: "id",
          as: "tipe_id",
        },
      },
      kategori_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "kategori_pelanggarans",
          key: "id",
          as: "tipe_id",
        },
      },
      point: {
        type: Sequelize.INTEGER
      },
      hukuman: {
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
    await queryInterface.dropTable('pelanggarans');
  }
};
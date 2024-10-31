"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wawancaras", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "users",
          key: "id",
          as: "user_id",
        },
      },
      method: {
        type: Sequelize.ENUM("online", "offline"),
        allowNull: false,
      },
      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status_tes: {
        type: Sequelize.ENUM("sudah", "belum"),
        defaultValue: "belum",
      },
      catatan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_lulus: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_batal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      pewawancara: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "pewawancara",
        },
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("wawancaras");
  },
};

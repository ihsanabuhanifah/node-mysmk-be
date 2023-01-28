'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notice", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      judul_notice: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tanggal_pengumuman: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      gambar_notice: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isi_notice: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_notice: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notice");
  }
};

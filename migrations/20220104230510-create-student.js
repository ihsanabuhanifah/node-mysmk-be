"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("students", {
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
      nama_siswa: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nis: {
        type: Sequelize.STRING,
      },
      nisn: {
        type: Sequelize.STRING,
      },
      nik: {
        type: Sequelize.STRING,
      },
      tempat_lahir: {
        type: Sequelize.STRING,
      },
      tanggal_lahir: {
        type: Sequelize.DATE,
      },

      alamat: {
        type: Sequelize.STRING,
      },
      sekolah_asal: {
        type: Sequelize.STRING,
      },
      jenis_kelamin: {
        type: Sequelize.STRING,
      },
      anak_ke: {
        type: Sequelize.INTEGER,
      },
      tanggal_diterima: {
        type: Sequelize.DATE,
      },
      angkatan: {
        type: Sequelize.STRING,
      },
      tahun_ajaran: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("students");
  },
};

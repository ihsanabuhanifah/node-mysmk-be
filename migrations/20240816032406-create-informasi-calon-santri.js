"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("informasi_calon_santris", {
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
        type: Sequelize.STRING,
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
      nama_ayah: {
        type: Sequelize.STRING,
      },
      nama_ibu: {
        type: Sequelize.STRING,
      },
      pekerjaan_ayah: {
        type: Sequelize.STRING,
      },
      pekerjaan_ibu: {
        type: Sequelize.STRING,
      },
      nama_wali: {
        type: Sequelize.STRING,
      },
      pekerjaan_wali: {
        type: Sequelize.STRING,
      },
      hubungan: {
        type: Sequelize.STRING,
      },
      kk: {
        type: Sequelize.STRING,
      },
      ijazah: {
        type: Sequelize.STRING,
      },
      akte: {
        type: Sequelize.STRING,
      },
      skb: {
        type: Sequelize.STRING,
      },
      surat_pernyataan: {
        type:Sequelize.STRING
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
    await queryInterface.dropTable("informasi_calon_santris");
  },
};

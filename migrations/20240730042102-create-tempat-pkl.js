"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tempat_pkl", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      created_by: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "created_by",
        },
      },
      kota: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kecamatan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alamat: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      provinsi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      desa: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rt: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rw: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      no_hp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      kode_pos: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      penanggung_jawab_perusahaan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      penanggung_jawab_sekolah: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      long: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      latitude: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tempat_pkl");
  },
};

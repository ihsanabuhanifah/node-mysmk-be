"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("izin_pulangs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      izin_dari: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      izin_sampai: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      kepentingan: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status_approval: {
        type: Sequelize.ENUM("menunggu", "disetujui", "ditolak"),
        allowNull: false,
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
      
      alasan_ditolak : {
        type:Sequelize.STRING,
      },
      
      tanggal_kembali: {
        type: Sequelize.DATE,
      },
      jam_kembali_ke_sekolah: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      status_kepulangan: {
        type: Sequelize.ENUM("terlambat", "tepat waktu"),
      },
      jumlah_hari_terlambat: {
        type: Sequelize.INTEGER,
      },
      denda : {
        type : Sequelize.STRING
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
    await queryInterface.dropTable("izin_pulangs");
  },
};

"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("absensi_kelas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tanggal: {
        type: Sequelize.DATE,
      },
      teacherId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacherId",
        },
      },
      studentId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "students",
          key: "id",
          as: "studentId",
        },
      },
      kelasId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "kelas",
          key: "id",
          as: "kelasId",
        },
      },
      mapelId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "mapels",
          key: "id",
          as: "mapelId",
        },
      },
      pelajaranKe: {
        type: Sequelize.INTEGER,
      },
      materi: {
        type: Sequelize.STRING,
      },
      statusKehadiran: {
        type: Sequelize.INTEGER,
      },
      keterangan: {
        type: Sequelize.STRING,
      },
      
      semester: {
        type: Sequelize.INTEGER,
      },
      tahunAjaran: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("absensi_kelas");
  },
};

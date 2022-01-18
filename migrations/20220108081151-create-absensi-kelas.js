"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("AbsensiKelas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tanggal: {
        type: Sequelize.DATE,
      },
      TeacherId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Teachers",
          key: "id",
          as: "TeacherId",
        },
      },
      StudentId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Students",
          key: "id",
          as: "StudentId",
        },
      },
      KelasId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Kelas",
          key: "id",
          as: "KelasId",
        },
      },
      MapelId: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "Mapels",
          key: "id",
          as: "MapelId",
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
    await queryInterface.dropTable("AbsensiKelas");
  },
};

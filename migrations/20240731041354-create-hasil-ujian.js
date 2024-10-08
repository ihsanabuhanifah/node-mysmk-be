"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("hasil_belajars", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kelas_id: {
        type: Sequelize.INTEGER,

        onDelete: "RESTRICT",
        references: {
          model: "kelas",
          key: "id",
          as: "kelas_id",
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
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
      },

      mapel_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "mapels",
          key: "id",
          as: "mapel_id",
        },
      },

      rata_nilai_tugas: {
        type: Sequelize.INTEGER,
      },
      rata_nilai_harian: {
        type: Sequelize.INTEGER,
      },
      rata_nilai_pts: {
        type: Sequelize.INTEGER,
      },
      rata_nilai_pas: {
        type: Sequelize.INTEGER,
      },
      rata_nilai_us: {
        type: Sequelize.INTEGER,
      },
      rata_nilai_kehadiran: {
        type: Sequelize.INTEGER,
      },

      nilai: {
        type: Sequelize.INTEGER,
      },
      deskripsi: {
        type: Sequelize.STRING,
      },

      ta_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "ta",
          key: "id",
          as: "ta_id",
        },
      },

      is_locked: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("hasil_belajars");
  },
};

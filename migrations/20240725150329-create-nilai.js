"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("nilais", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ujian_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "ujians",
          key: "id",
          as: "ujian_id",
        },
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
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
      jawaban: {
        type: Sequelize.TEXT,
      },

      jam_mulai: {
        type: Sequelize.DATE,
      },
      jam_selesai: {
        type: Sequelize.DATE,
      },
      
      waktu_tersisa: {
        type: Sequelize.INTEGER,
      },

      exam1: {
        type: Sequelize.DECIMAL(4, 2),
      },
      exam2: {
        type: Sequelize.DECIMAL(4, 2),
      },
      exam3: {
        type: Sequelize.DECIMAL(4, 2),
      },
      exam4: {
        type: Sequelize.DECIMAL(4, 2),
      },
      exam_result: {
        type: Sequelize.DECIMAL(4, 2),
      },
      refresh_count: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM('finish', 'open', 'progress', 'locked'),
        defaultValue : 'open'
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
    await queryInterface.dropTable("nilais");
  },
};
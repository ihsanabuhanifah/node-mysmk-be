"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("nilai_ppdbs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ujian_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ujians",
          key: "id",
          as: "ujian_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "teachers",
          key: "id",
          as: "teacher_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
          as: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      jawaban: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_lulus: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("finish", "open", "progress", "locked"),
        allowNull: false,
        defaultValue: "open",
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
    await queryInterface.dropTable("nilai_ppdbs");
  },
};

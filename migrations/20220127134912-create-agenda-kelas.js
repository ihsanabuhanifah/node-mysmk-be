'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agenda_kelas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tanggal: {
        type: Sequelize.DATEONLY
      },
      mapel_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "mapels",
          key: "id",
          as: "mapel_id",
        },
      },
      kelas_id: {
        type: Sequelize.INTEGER,

        onDelete: "CASCADE",
        references: {
          model: "kelas",
          key: "id",
          as: "kelas_id",
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
      jam_ke: {
        type: Sequelize.INTEGER
      },
      materi: {
        type: Sequelize.STRING
      },
      keterangan: {
        type: Sequelize.STRING
      },
      semester: {
        type: Sequelize.INTEGER,
      },
      ta_id: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('agenda_kelas');
  }
};
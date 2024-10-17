'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pembayaran_spps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      student_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "students",
          key: "id",
          as: "student_id"
        }
      },

      walsan_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "parents",
          key: "id",
          as: "walsan_id"
        }
      },
      ta_id: {
        type:Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "ta",
          key: "id",
          as: "ta_id"
        }
      },
      tanggal: {
        type: Sequelize.DATE
      },
      foto: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM("Sudah", "Belum")
      },
      bulan: {
        type: Sequelize.STRING
      },
      tahun: {
        type: Sequelize.STRING
      },
      nominal : {
        type: Sequelize.DECIMAL(10, 2)
      },
      tanggal_konfirmasi:{
        allowNull: false,
        type: Sequelize.DATE
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: 'teachers',
          key: "id",
          as: "teacher_id"
        }
      },
      no_telepon: {
        type: Sequelize.STRING
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pembayaran_spps');
  }
};
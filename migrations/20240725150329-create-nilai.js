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
      jenis_ujian: {
        type: Sequelize.STRING,
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
      ta_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
        references: {
          model: "ta",
          key: "id",
          as: "ta_id",
        },
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
      student_id: {
        type: Sequelize.INTEGER,
        onDelete: "RESTRICT",
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
      jam_submit: {
        type: Sequelize.DATE,
      },
      jam_progress: {
        type: Sequelize.DATE,
      },
      keterangan: {
        type: Sequelize.STRING,
      },
      upload_file: {
        type: Sequelize.STRING,
      },
      
      waktu_tersisa: {
        type: Sequelize.INTEGER,
      },
      remidial_count: {
        type: Sequelize.INTEGER,
      },
      

     
      exam: {
        type: Sequelize.STRING,
      },
      
      exam_result: {
        type: Sequelize.DECIMAL(5, 2),
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
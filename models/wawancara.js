"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class wawancara extends Model {
    static associate(models) {
      // Menghubungkan wawancara ke User
      wawancara.belongsTo(models.user, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });
      // Menghubungkan wawancara ke Teacher sebagai pewawancara
      wawancara.belongsTo(models.teacher, {
        foreignKey: "pewawancara",
        as: "guruWawancara",
        onDelete: "CASCADE",
      });
    }
  }

  wawancara.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM("online", "offline"),
        allowNull: false,
      },
      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status_tes: {
        type: DataTypes.ENUM("sudah", "belum"),
        defaultValue: "belum",
      },
      catatan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_lulus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_batal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pewawancara: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "wawancara",
      tableName: "wawancaras",
      underscored: true, // Agar kolom menggunakan snake_case
      timestamps: true, // Menyertakan createdAt dan updatedAt secara otomatis
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return wawancara;
};
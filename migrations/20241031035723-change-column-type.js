"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("pembayaran_ppdbs", "keterangan", {
      type: Sequelize.ENUM("biaya pendaftaran", "bayar ulang"),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Pastikan Anda menentukan tipe kolom asli di bagian down
    await queryInterface.changeColumn("pembayaran_ppdbs", "keterangan", {
      type: Sequelize.STRING,
      allowNull: true, // Sesuaikan dengan properti kolom sebelumnya
    });

    // Jika ingin menghapus ENUM setelah rollback, gunakan:
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pembayaran_ppdbs_keterangan";');
  },
};

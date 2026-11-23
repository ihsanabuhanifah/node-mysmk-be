'use strict';

// Audit log: catatan aktivitas staf (admin & guru) - siapa melakukan apa dan kapan.
// Diisi otomatis oleh middleware/auditLogMiddleware.js (POST/PUT/PATCH/DELETE)
// dan oleh AuthController (LOGIN, LOGIN_GAGAL, LOGOUT).
// Tidak memakai foreign key ke users agar log tetap ada walaupun user dihapus,
// dan agar LOGIN_GAGAL (user tidak dikenal) tetap bisa dicatat.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      user_id: { type: Sequelize.INTEGER, allowNull: true },
      user_name: { type: Sequelize.STRING(150), allowNull: true },
      // email user (untuk LOGIN_GAGAL: email yang dicoba)
      user_email: { type: Sequelize.STRING(150), allowNull: true },
      role: { type: Sequelize.STRING(50), allowNull: true },
      // CREATE | UPDATE | DELETE | LOGIN | LOGIN_GAGAL | LOGOUT
      action: { type: Sequelize.STRING(20), allowNull: false },
      method: { type: Sequelize.STRING(10), allowNull: true },
      // pola route (mis. /guru/daftar-guru/:id/roles), atau URL tanpa query
      path: { type: Sequelize.STRING(255), allowNull: true },
      target_id: { type: Sequelize.STRING(64), allowNull: true },
      status_code: { type: Sequelize.INTEGER, allowNull: true },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },
      // body request yang sudah disaring (tanpa password/token), maks ~5KB
      data: { type: Sequelize.TEXT, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('audit_logs', ['action']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};

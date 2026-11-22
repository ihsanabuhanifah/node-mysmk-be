'use strict';

// Refresh token (disimpan sebagai hash SHA-256, bukan token aslinya).
// Dirotasi setiap dipakai: token lama dicabut (revoked_at) dan diganti token baru.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: { model: 'users', key: 'id' },
      },
      token_hash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      // role yang dipilih saat login (dipakai untuk membangun ulang isi access token)
      login_as: { type: Sequelize.INTEGER, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked_at: { type: Sequelize.DATE, allowNull: true },
      // alasan dicabut: rotated | logout | reuse | blocked
      revoked_reason: { type: Sequelize.STRING(20), allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};

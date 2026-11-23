'use strict';
const { Model } = require('sequelize');

// Audit log aktivitas staf. Hanya punya created_at (tidak pernah di-update).
module.exports = (sequelize, DataTypes) => {
  class audit_log extends Model {
    static associate() {}
  }
  audit_log.init(
    {
      user_id: DataTypes.INTEGER,
      user_name: DataTypes.STRING,
      user_email: DataTypes.STRING,
      role: DataTypes.STRING,
      action: DataTypes.STRING,
      method: DataTypes.STRING,
      path: DataTypes.STRING,
      target_id: DataTypes.STRING,
      status_code: DataTypes.INTEGER,
      ip: DataTypes.STRING,
      user_agent: DataTypes.STRING,
      data: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'audit_log',
      tableName: 'audit_logs',
      updatedAt: false,
    }
  );
  return audit_log;
};

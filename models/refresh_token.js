'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class refresh_token extends Model {
    static associate(models) {
      refresh_token.belongsTo(models.user, { as: 'user', foreignKey: 'user_id' });
    }
  }
  refresh_token.init(
    {
      user_id: DataTypes.INTEGER,
      token_hash: DataTypes.STRING,
      login_as: DataTypes.INTEGER,
      expires_at: DataTypes.DATE,
      revoked_at: DataTypes.DATE,
      revoked_reason: DataTypes.STRING,
      user_agent: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'refresh_token',
      tableName: 'refresh_tokens',
    }
  );
  return refresh_token;
};

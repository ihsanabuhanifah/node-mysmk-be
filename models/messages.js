'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class messages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  messages.init({
    id: {
      type: DataTypes.DATE, // jika ingin menggunakan tanggal sebagai id
      primaryKey: true,     // tandai sebagai primary key
    },
    text: DataTypes.STRING,
    pengirim: DataTypes.STRING,
    penerima: DataTypes.STRING,
    role: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'messages',
    underscored: false,
    timestamps: true, 
  });
  return messages;
};
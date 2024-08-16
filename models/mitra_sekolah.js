"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mitra_sekolah extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mitra_sekolah.init(
    {
      img_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "mitra_sekolah",
    }
  );
  return mitra_sekolah;
};

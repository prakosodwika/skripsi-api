'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbadmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbadmin.init({
    nama: DataTypes.STRING(45),
    password: DataTypes.STRING(100)
  }, {
    sequelize,
    freezeTableName: 'tbadmin',
    modelName: 'tbadmin',
  });
  return tbadmin;
};
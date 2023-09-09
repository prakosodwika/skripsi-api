'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbpatterns extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tbpatterns.hasMany(models.tbdetailpatterns, {foreignKey: 'idPatterns'})
    }
  }
  tbpatterns.init({
    tag: DataTypes.STRING(45)
  }, {
    sequelize,
    freezeTableName: 'tbpatterns',
    modelName: 'tbpatterns',
  });
  return tbpatterns;
};
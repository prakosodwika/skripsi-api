'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbdetailpatterns extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tbdetailpatterns.belongsTo(models.tbpatterns, {foreignKey: 'idPatterns'})
    }
  }
  tbdetailpatterns.init({
    pesan: DataTypes.STRING(100),
    tipe: DataTypes.STRING(45),
    idPatterns: DataTypes.INTEGER
  }, {
    sequelize,
    freezeTableName: 'tbdetailpatterns',
    modelName: 'tbdetailpatterns',
  });
  return tbdetailpatterns;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbmenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tbmenu.belongsTo(models.tbrestoran, {foreignKey: 'idRestoran'})
      tbmenu.hasMany(models.tbdetailtransaksi, {foreignKey: 'idMenu'})
    }
  }
  tbmenu.init({
    nama: DataTypes.STRING(45),
    tipe: DataTypes.STRING(45),
    harga: DataTypes.INTEGER,
    idRestoran: DataTypes.INTEGER
  }, {
    sequelize,
    freezeTableName: 'tbmenu',
    modelName: 'tbmenu',
  });
  return tbmenu;
};
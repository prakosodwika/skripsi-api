'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbdetailtransaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tbdetailtransaksi.belongsTo(models.tbtransaksi, {foreignKey: 'idTransaksi'})
      tbdetailtransaksi.belongsTo(models.tbmenu, {foreignKey: 'idMenu'})
    }
  }
  tbdetailtransaksi.init({
    idTransaksi: DataTypes.INTEGER,
    idMenu: DataTypes.INTEGER,
    qty: DataTypes.INTEGER,
    harga: DataTypes.INTEGER
  }, {
    sequelize,
    freezeTableName: 'tbdetailtransaksi',
    modelName: 'tbdetailtransaksi',
  });
  return tbdetailtransaksi;
};
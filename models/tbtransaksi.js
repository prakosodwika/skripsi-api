'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbtransaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tbtransaksi.hasMany(models.tbdetailtransaksi, {foreignKey: 'idTransaksi'})
      tbtransaksi.belongsTo(models.tbrestoran, {foreignKey: 'idRestoran'})
    }
  }
  tbtransaksi.init({
    idRestoran: DataTypes.INTEGER,
    username: DataTypes.STRING(45),
    nomorMeja: DataTypes.INTEGER,
    tanggalBayar: DataTypes.DATE,
    status: DataTypes.STRING(45)
  }, {
    sequelize,
    freezeTableName: 'tbtransaksi',
    modelName: 'tbtransaksi',
  });
  return tbtransaksi;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbrestoran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tbrestoran.hasMany(models.tbmenu, {foreignKey: 'idRestoran'})
      tbrestoran.hasMany(models.tbtransaksi, {foreignKey: 'idRestoran'})
    }
  }
  tbrestoran.init({
    nama: DataTypes.STRING(45),
    email: DataTypes.STRING(45),
    nomorTelepon: DataTypes.STRING(45),
    alamat: DataTypes.STRING(45),
    fotoMenu: DataTypes.STRING(255),
    password: DataTypes.STRING(100),
    status: DataTypes.STRING(45),
    qrchatbot: DataTypes.STRING(255),
    jumlahMeja: DataTypes.INTEGER
  }, {
    sequelize,
    freezeTableName: 'tbrestoran',
    modelName: 'tbrestoran',
  });
  return tbrestoran;
};
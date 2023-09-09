'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbdetailtransaksi', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idTransaksi: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbtransaksi',
          id: 'id'
        }
      },
      idMenu: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tbmenu',
          id: 'id'
        }
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      harga: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbdetailtransaksi');
  }
};
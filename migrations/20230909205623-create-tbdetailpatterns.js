'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbdetailpatterns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pesan: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      tipe: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      idPatterns: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "tbpatterns",
          key: 'id'
        }
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
    await queryInterface.dropTable('tbdetailpatterns');
  }
};
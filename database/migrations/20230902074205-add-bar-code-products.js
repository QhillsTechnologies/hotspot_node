'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'bar_code', {
      type: Sequelize.STRING, 
      allowNull: true,      
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('order_details', 'category');
  }
};

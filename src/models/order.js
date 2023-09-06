'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order.init({
    order_number: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'order',
  });

  Order.addHook('beforeBulkDestroy', async (options) => {
    if (options.where && Object.keys(options.where).length === 0) {
      // All entries will be deleted
      // Reset the auto-increment counter to 1
      await sequelize.query('ALTER TABLE "orders" AUTO_INCREMENT = 1;');
    }
  });
  return Order;
};
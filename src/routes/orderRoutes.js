const express = require("express");
const { authToken } = require("../middlewares/authMiddlewares");
const router = express.Router();
const orders = require("../models").order;
const orderDetails = require("../models").order_details;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//Home
router.get("/homepage", (req, res) => {
  res.status(200).send("Welcome to Blog App. Kindly register or Login");
});

//create-order
router.post("/create-order", authToken, async (req, res) => {
  try {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0); // Start of today
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999); // End of today

    const todaysMaxOrderNumber = await orders.max('order_number', {
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Calculate the next order_number
    const nextOrderNumber = todaysMaxOrderNumber !== null ? todaysMaxOrderNumber + 1 : 1;

    const order = await orders.create({
      order_number: nextOrderNumber,
      // createdAt will be automatically populated based on your ORM configuration
    });

    if (!order) {
      res.status(500).send("Order creation failed");
      return;
    }

    res.send("Order created successfully");
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.post("/create-order-details",authToken, async (req, res) => {
  const { order_id, product_name, product_price, category, order_number } = req.body;
  console.log("REQ: ", req.body)
  try {
    let quantity = 1;
    const detailsExist = await orderDetails.findOne({
      where: {
        order_id,
        product_name,
        product_price,
        category
      }
    });
    if(detailsExist) {
      quantity = detailsExist.quantity + 1;

      await orderDetails.update(
        {
          quantity: quantity,
          total_price: quantity*(detailsExist.product_price),
        },
        {
        where:
        {
          order_id,
          order_number,
          product_name,
          product_price,
          category,
        }
      }
      );
    }

    if(!detailsExist) {
    const details = await orderDetails.create(
      {
        order_id,
        order_number,
        product_name,
        product_price,
        category,
        quantity,
        total_price: quantity * product_price,
      }
    );
    }
    // if (!details) {
    //   res.status(500).send("Adding order details failed");
    // }

    res.send("Order details added successfully");
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.get("/get-orders", authToken, async (req, res) => {
  try {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0); // Start of today
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999); // End of today

    const order_data = await orders.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: 'pending'
      }
    });

    res.send(order_data);
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.get("/get-order-details",authToken, async (req, res) => {
  try {
    const { order_id } = req.query;
    const order_details = await orderDetails
      .findAll({
        where : {
          order_id
        },
        order: [['createdAt', 'DESC']]
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.log("error: ", error);
      });
    res.send(order_details);
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.put("/change-quantity", authToken, async (req, res) => {
    const { id, option, order_id } = req.body;
    try {

      const existingOrder = await orderDetails.findOne({
        where: {
          id
        }
      });

      if (!existingOrder) {
        res.status(500).send("Order does not exist");
      }

      let updatedData;

      if(option === 'minus' && existingOrder.quantity > 1) {
        updatedData = {
          quantity: existingOrder.quantity - 1,
          total_price: (existingOrder.quantity - 1) * (existingOrder.product_price)
        }
      }

      if(option === 'plus') {
        updatedData = {
          quantity: existingOrder.quantity + 1,
          total_price: (existingOrder.quantity + 1) * (existingOrder.product_price)
        }
      }


      if (updatedData) {
        await orderDetails.update( updatedData,{
          where: {
             id
          }
        });

        existingOrder.quantity = updatedData.quantity;
        existingOrder.total_price = updatedData.total_price;
      }
        

    const updatedEntry = [];
    updatedEntry.push(existingOrder);

    res.send(updatedEntry);

    } catch(error) {
      console.log('error: ', error);
      res.status(500).send(error);

    }
});

router.get("/get-all-orders", authToken, async (req, res) => {
  try {
    // Destructure the properties from req.body
    const { orderNumber, orderStatus, orderDate } = req.query;

    // If req.body is empty, return all orders
    // if (!orderNumber && !orderStatus && !orderDate) {
    //   const allOrders = await orders.findAll();
    //   return res.send(allOrders);
    // }

    let query = {};

    if (orderNumber) query.order_number = orderNumber;
    if (orderStatus) query.status = orderStatus;

    if (orderDate) {
      const dateParts = orderDate.split('-'); // Assuming the date format is "YYYY-MM-DD"
      const conditions = [
        Sequelize.where(
          Sequelize.fn('date_part', 'year', Sequelize.col('createdAt')),
          dateParts[0]
        ),
        Sequelize.where(
          Sequelize.fn('date_part', 'month', Sequelize.col('createdAt')),
          dateParts[1]
        ),
        Sequelize.where(
          Sequelize.fn('date_part', 'day', Sequelize.col('createdAt')),
          dateParts[2]
        )
      ];
      query.createdAt = {
        [Op.and]: conditions
      };
    }

    const allOrders = await orders.findAll({ where: query });
    res.send(allOrders);
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.get("/get-all-order-details", authToken, async(req, res) => {
  try {
    const { order_id } = req.query;
    const orderDetailsForOrder = await orderDetails.findAll({
      where : {
        order_id
      }
    });
    res.send(orderDetailsForOrder);
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.put("/update-order-status", authToken, async (req, res) => {
  try {
    const { id, updateOrderStatus} = req.body;
    await orders.update({
      status: updateOrderStatus
    }, {
      where: {
        id
      }
    });

    const updatedOrder = await orders.findOne({
      where: {
        id
      }
    });

    res.send(updatedOrder);
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send(error);
  }
});

router.delete("/delete-order-detail", authToken, async (req, res) => {
 const { id } = req.query;
  try {
    const deleteOrderDetail = await orderDetails.destroy({
      where : {
        id
      }
    });

    if (!deleteOrderDetail) {
      res.status(500).send("Delete operation failed");
    }

    res.send("Deleted Successfully");

  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send(error);
  }

})



module.exports = router;

const express = require("express");
const router = express.Router();
const orders = require("../models").order;
const orderDetails = require("../models").order_details;

//Home
router.get("/homepage", (req, res) => {
  res.status(200).send("Welcome to Blog App. Kindly register or Login");
});

//create-order
router.post("/create-order", async (req, res) => {
  try {
    const maxOrderNumber = await orders.max('order_number');

    // Calculate the next order_number
    const nextOrderNumber = maxOrderNumber !== null ? maxOrderNumber + 1 : 1;

    const order = await orders.create({
      order_number: nextOrderNumber
    });
    if (!order) {
      res.status(500).send("Order creation failed");
    }

    res.send("Order created successfully");
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.post("/create-order-details", async (req, res) => {
  const { order_number, product_name, product_price, category } = req.body;
  try {
    let quantity = 1;
    const detailsExist = await orderDetails.findOne({
      where: {
        order_number,
        product_name,
        product_price,
        category
      }
    });
    if(detailsExist) {
      quantity = detailsExist.quantity + 1;
      console.log("qunt: ", quantity, category);
      await orderDetails.update(
        {
          quantity: quantity,
          total_price: quantity*(detailsExist.product_price),
        },
        {
        where:
        {
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

router.get("/get-orders", async (req, res) => {
  try {
    const order_data = await orders
      .findAll()
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.log("error: ", error);
      });
    res.send(order_data);
  } catch (err) {
    console.log("error", "Error: ", err);
    res.status(500).send(err);
  }
});

router.get("/get-order-details", async (req, res) => {
  try {
    const { order_number } = req.query;
    const order_details = await orderDetails
      .findAll({
        where : {
          order_number
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

router.put("/change-quantity", async (req, res) => {
    const { id, option, order_number } = req.body;
    console.log("req.body: ", req.body)
    try {

      const existingOrder = await orderDetails.findOne({
        where: {
          id,
          order_number
        }
      });

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


        await orderDetails.update( updatedData,{
          where: {
             id,
             order_number
          }
        });
 
    existingOrder.quantity = updatedData.quantity;
    existingOrder.total_price = updatedData.total_price;

    const updatedEntry = [];
    updatedEntry.push(existingOrder);


      res.send(updatedEntry);

    } catch(error) {

    }
});



module.exports = router;

const express = require("express");
const router = express.Router();
const products = require("../models").product;


router.get("/get-products", async (req, res) => {
    try {
        const { category } = req.query;
        const product_data = await products.findAll({
            where : {
                category,
            }
        }).then((data) => {
            return data;
        }).catch((error) => {
            console.log("error: ", error);
        });
        res.send(product_data);
    } catch(err) {
        console.log("error", "Error: ", err);
        res.status(500).send(err);
    }
});

router.get("/get-barcode-product", async (req, res) => {
    try {
        const { bar_code } = req.query;
        const product_data = await products.findOne({
            where : {
                bar_code,
            }
        });

        if( product_data ) {
          res.send(product_data);
        }
    } catch(err) {
        console.log("error", "Error: ", err);
        res.status(500).send(err);
    }
});

router.post("/add-product", async (req, res) => {
  try {
    const productData = req.body;

    if (!productData) {
      return res.status(400).send("Product data is missing.");
    }
    const productExist = await products.findOne({
        where: productData
    });

    if(productExist) {
        return res.status(500).send("Product already exists");
    }

    const createProduct = await products.create(productData);

    if (createProduct) {
      return res.status(201).send("Product created successfully.");
    } else {
      return res.status(500).send("Failed to create the product.");
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .send("An error occurred while processing your request. ", err);
  }
});

module.exports = router;
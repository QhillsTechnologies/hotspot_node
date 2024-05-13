const express = require("express");
const router = express.Router();
const products = require("../models").product;
const { authToken, authRole } = require("../middlewares/authMiddlewares");
const { validateAddProduct } = require("../middlewares/validationMiddlewares");


router.get("/get-products", authToken, async (req, res) => {
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
                barcode: bar_code,
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

router.post("/add-product",validateAddProduct, authRole('Admin'), authToken, async (req, res) => {
  try {
    const productData = req.body;

    console.log("DATA: ", productData);

    if (!productData) {
      return res.status(400).send("Product data is missing.");
    }
    const productExist = await products.findOne({
        where: {
            price: productData.price,
            name: productData.name,
            category: productData.category,
            barcode: productData.bar_code,
        }
    });

    if(productExist) {
        return res.status(500).json("Product already exists");
    }

    const insertData = {
        price: productData.price,
        name: productData.name,
        category: productData.category,
        barcode: productData.bar_code,
    }
    console.log("DATA: ", insertData);
    const createProduct = await products.create(insertData);
    console.log('barcodeprod: ', createProduct);
    if (createProduct) {
      return res.status(201).json("Product created successfully.");
    } else {
      return res.status(500).json("Failed to create the product.");
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json(err);
  }
});

module.exports = router;
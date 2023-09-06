const express = require("express");
const router = express.Router();

require("dotenv").config();

const orderRoutes=require("./orderRoutes")
const productRoutes=require("./productRoutes")

router.use('/',orderRoutes)
router.use('/',productRoutes)

module.exports = router;
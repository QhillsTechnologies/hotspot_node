const express = require("express");
const router = express.Router();

require("dotenv").config();

const orderRoutes=require("./orderRoutes")
const productRoutes=require("./productRoutes")
const userRoutes=require('./userRoutes');

router.use('/',orderRoutes)
router.use('/',productRoutes)
router.use('/',userRoutes)

module.exports = router;
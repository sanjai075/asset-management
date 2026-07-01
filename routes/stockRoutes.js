const express = require("express");
const router = express.Router();
const StockController = require("../controllers/StockController");

// Stock View Routes
router.get("/", StockController.getStockView);

module.exports = router;

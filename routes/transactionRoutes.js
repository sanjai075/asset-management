const express = require("express");
const router = express.Router();
const TransactionController = require("../controllers/TransactionController");

// Asset Issuance
router.get("/issue", TransactionController.showIssueForm);
router.post("/issue", TransactionController.issueAsset);

// Asset Return
router.get("/return", TransactionController.showReturnForm);
router.post("/return", TransactionController.returnAsset);

// Asset Scrap
router.get("/scrap", TransactionController.showScrapForm);
router.post("/scrap", TransactionController.scrapAsset);

module.exports = router;

const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/AssetController");

// Asset CRUD Routes
router.get("/", AssetController.getAssets);
router.get("/create", AssetController.showCreateForm);
router.post("/create", AssetController.createAsset);
router.get("/edit/:id", AssetController.showEditForm);
router.post("/edit/:id", AssetController.updateAsset);
router.get("/history/:id", AssetController.getAssetHistory);

module.exports = router;

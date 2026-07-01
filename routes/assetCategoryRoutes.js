const express = require("express");
const router = express.Router();
const AssetCategoryController = require("../controllers/AssetCategoryController");

// Category CRUD Routes
router.get("/", AssetCategoryController.getCategories);
router.get("/create", AssetCategoryController.showCreateForm);
router.post("/create", AssetCategoryController.createCategory);
router.get("/edit/:id", AssetCategoryController.showEditForm);
router.post("/edit/:id", AssetCategoryController.updateCategory);

module.exports = router;

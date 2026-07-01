const { Op } = require("sequelize");
const Asset = require("../models/Asset");
const AssetCategory = require("../models/AssetCategory");
const AssetTransaction = require("../models/AssetTransaction");
const Employee = require("../models/Employee");

// Show list of assets
const getAssets = async (req, res) => {
    try {
        const search = req.query.search || "";
        const categoryId = req.query.categoryId || "";

        // Base where clause to exclude scrapped assets by default
        const whereClause = {
            status: { [Op.ne]: "SCRAPPED" }
        };

        // Add search by Make or Model
        if (search) {
            whereClause[Op.or] = [
                { make: { [Op.iLike]: `%${search}%` } },
                { model: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Add filter by Category
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        const assets = await Asset.findAll({
            where: whereClause,
            include: [{ model: AssetCategory, as: "category" }],
            order: [["id", "ASC"]],
        });

        const categories = await AssetCategory.findAll({ order: [["name", "ASC"]] });

        res.render("assets/index", {
            assets,
            categories,
            search,
            categoryId,
        });
    } catch (error) {
        console.error("Error fetching assets:", error);
        res.status(500).send("Something went wrong while fetching assets.");
    }
};

// Show add asset form
const showCreateForm = async (req, res) => {
    try {
        const categories = await AssetCategory.findAll({ order: [["name", "ASC"]] });
        res.render("assets/create", { categories });
    } catch (error) {
        console.error("Error loading asset create form:", error);
        res.status(500).send("Error loading asset creation page.");
    }
};

// Save asset details
const createAsset = async (req, res) => {
    try {
        const { assetCode, serialNumber, make, model, purchaseDate, value, branch, categoryId } = req.body;

        if (!assetCode || !serialNumber || !make || !model || !purchaseDate || !value || !branch || !categoryId) {
            return res.status(400).send("All fields are required.");
        }

        await Asset.create({
            assetCode: assetCode.trim(),
            serialNumber: serialNumber.trim(),
            make: make.trim(),
            model: model.trim(),
            purchaseDate,
            value: parseFloat(value),
            branch: branch.trim(),
            categoryId: parseInt(categoryId),
            status: "AVAILABLE",
        });

        res.redirect("/assets");
    } catch (error) {
        console.error("Error creating asset:", error);
        res.status(400).send("Error creating asset: " + error.message);
    }
};

// Show edit form
const showEditForm = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Asset ID. ID must be a number.");
    }

    try {
        const asset = await Asset.findByPk(id);
        if (!asset) {
            return res.status(404).send("Asset not found.");
        }

        // Cannot edit scrapped assets from normal screen
        if (asset.status === "SCRAPPED") {
            return res.status(400).send("Cannot edit a scrapped asset.");
        }

        const categories = await AssetCategory.findAll({ order: [["name", "ASC"]] });
        res.render("assets/edit", { asset, categories });
    } catch (error) {
        console.error("Error loading asset edit form:", error);
        res.status(500).send("Error fetching asset details: " + error.message);
    }
};

// Update asset details
const updateAsset = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Asset ID. ID must be a number.");
    }

    try {
        const { assetCode, serialNumber, make, model, purchaseDate, value, branch, categoryId } = req.body;

        if (!assetCode || !serialNumber || !make || !model || !purchaseDate || !value || !branch || !categoryId) {
            return res.status(400).send("All fields are required.");
        }

        const asset = await Asset.findByPk(id);
        if (!asset) {
            return res.status(404).send("Asset not found.");
        }

        // Cannot update scrapped assets
        if (asset.status === "SCRAPPED") {
            return res.status(400).send("Cannot update a scrapped asset.");
        }

        await Asset.update(
            {
                assetCode: assetCode.trim(),
                serialNumber: serialNumber.trim(),
                make: make.trim(),
                model: model.trim(),
                purchaseDate,
                value: parseFloat(value),
                branch: branch.trim(),
                categoryId: parseInt(categoryId),
            },
            {
                where: { id }
            }
        );

        res.redirect("/assets");
    } catch (error) {
        console.error("Error updating asset:", error);
        res.status(400).send("Error updating asset details: " + error.message);
    }
};

// Display Asset History (Chronological Transaction history)
const getAssetHistory = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Asset ID. ID must be a number.");
    }

    try {
        const asset = await Asset.findByPk(id, {
            include: [{ model: AssetCategory, as: "category" }],
        });

        if (!asset) {
            return res.status(404).send("Asset not found.");
        }

        // Fetch related transactions ordered chronologically
        const transactions = await AssetTransaction.findAll({
            where: { assetId: id },
            include: [{ model: Employee, as: "employee" }],
            order: [["transactionDate", "ASC"], ["id", "ASC"]],
        });

        res.render("assets/history", {
            asset,
            transactions,
        });
    } catch (error) {
        console.error("Error fetching asset history:", error);
        res.status(500).send("Error retrieving asset history: " + error.message);
    }
};

module.exports = {
    getAssets,
    showCreateForm,
    createAsset,
    showEditForm,
    updateAsset,
    getAssetHistory,
};

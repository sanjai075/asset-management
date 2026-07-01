const { Op } = require("sequelize");
const AssetCategory = require("../models/AssetCategory");

// Get list of all categories
const getCategories = async (req, res) => {
    try {
        const search = req.query.search || "";

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const categories = await AssetCategory.findAll({
            where: whereClause,
            order: [["id", "ASC"]],
        });

        res.render("categories/index", {
            categories,
            search,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Something went wrong while retrieving categories.");
    }
};

// Show add category form
const showCreateForm = async (req, res) => {
    try {
        res.render("categories/create");
    } catch (error) {
        console.error("Error rendering create form:", error);
        res.status(500).send("Error loading category creation page.");
    }
};

// Handle category creation
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).send("Category name is required.");
        }

        await AssetCategory.create({
            name: name.trim(),
            description: description ? description.trim() : ""
        });

        res.redirect("/categories");
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(400).send("Error creating category: " + error.message);
    }
};

// Show edit form
const showEditForm = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Category ID. ID must be a number.");
    }

    try {
        const category = await AssetCategory.findByPk(id);

        if (!category) {
            return res.status(404).send("Asset Category not found.");
        }

        res.render("categories/edit", { category });
    } catch (error) {
        console.error("Error fetching category for edit:", error);
        res.status(500).send("Error fetching category details: " + error.message);
    }
};

// Handle category update
const updateCategory = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Category ID. ID must be a number.");
    }

    try {
        const { name, description } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).send("Category name is required.");
        }

        await AssetCategory.update(
            {
                name: name.trim(),
                description: description ? description.trim() : ""
            },
            {
                where: { id }
            }
        );

        res.redirect("/categories");
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(400).send("Error updating category details: " + error.message);
    }
};

module.exports = {
    getCategories,
    showCreateForm,
    createCategory,
    showEditForm,
    updateCategory,
};

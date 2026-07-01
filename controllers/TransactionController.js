const sequelize = require("../config/database");
const Asset = require("../models/Asset");
const Employee = require("../models/Employee");
const AssetCategory = require("../models/AssetCategory");
const AssetTransaction = require("../models/AssetTransaction");

// Show issue form
const showIssueForm = async (req, res) => {
    try {
        // Fetch only active employees
        const employees = await Employee.findAll({
            where: { status: "ACTIVE" },
            order: [["name", "ASC"]]
        });

        // Fetch only available assets
        const assets = await Asset.findAll({
            where: { status: "AVAILABLE" },
            include: [{ model: AssetCategory, as: "category" }],
            order: [["assetCode", "ASC"]]
        });

        res.render("transactions/issue", { employees, assets });
    } catch (error) {
        console.error("Error loading issue form:", error);
        res.status(500).send("Error loading asset issuance page.");
    }
};

// Handle asset issuance
const issueAsset = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { employeeId, assetId, notes } = req.body;

        if (!employeeId || !assetId) {
            await t.rollback();
            return res.status(400).send("Employee and Asset are required.");
        }

        const employee = await Employee.findByPk(employeeId);
        const asset = await Asset.findByPk(assetId);

        if (!employee || employee.status !== "ACTIVE") {
            await t.rollback();
            return res.status(400).send("Selected employee is invalid or inactive.");
        }

        if (!asset || asset.status !== "AVAILABLE") {
            await t.rollback();
            return res.status(400).send("Selected asset is not available.");
        }

        // Create transaction record
        await AssetTransaction.create({
            assetId,
            employeeId,
            transactionType: "ISSUE",
            notes: notes ? notes.trim() : "",
            transactionDate: new Date()
        }, { transaction: t });

        // Update asset status
        await Asset.update(
            { status: "ISSUED" },
            { where: { id: assetId }, transaction: t }
        );

        await t.commit();
        res.redirect("/assets");
    } catch (error) {
        await t.rollback();
        console.error("Error issuing asset:", error);
        res.status(500).send("Error performing asset issuance: " + error.message);
    }
};

// Show return form
const showReturnForm = async (req, res) => {
    try {
        // Fetch all assets that are currently ISSUED
        const assets = await Asset.findAll({
            where: { status: "ISSUED" },
            include: [{ model: AssetCategory, as: "category" }],
            order: [["assetCode", "ASC"]]
        });

        // Resolve current employee assigned to each issued asset
        const issuedAssets = await Promise.all(assets.map(async (asset) => {
            const latestIssue = await AssetTransaction.findOne({
                where: { assetId: asset.id, transactionType: "ISSUE" },
                include: [{ model: Employee, as: "employee" }],
                order: [["id", "DESC"]]
            });
            return {
                asset,
                employee: latestIssue ? latestIssue.employee : null
            };
        }));

        res.render("transactions/return", { issuedAssets });
    } catch (error) {
        console.error("Error loading return form:", error);
        res.status(500).send("Error loading asset return page.");
    }
};

// Handle asset return
const returnAsset = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { assetId, reason, notes } = req.body;

        if (!assetId || !reason) {
            await t.rollback();
            return res.status(400).send("Asset and Return Reason are required.");
        }

        const asset = await Asset.findByPk(assetId);
        if (!asset || asset.status !== "ISSUED") {
            await t.rollback();
            return res.status(400).send("Asset must be currently in ISSUED status to be returned.");
        }

        // Find the latest assignee
        const latestIssue = await AssetTransaction.findOne({
            where: { assetId, transactionType: "ISSUE" },
            order: [["id", "DESC"]]
        });

        const employeeId = latestIssue ? latestIssue.employeeId : null;

        // Determine new asset status based on return reason
        let newStatus = "AVAILABLE";
        if (reason === "Repair") {
            newStatus = "UNDER_REPAIR";
        }

        // Create transaction record
        await AssetTransaction.create({
            assetId,
            employeeId,
            transactionType: "RETURN",
            reason,
            notes: notes ? notes.trim() : "",
            transactionDate: new Date()
        }, { transaction: t });

        // Update asset status
        await Asset.update(
            { status: newStatus },
            { where: { id: assetId }, transaction: t }
        );

        await t.commit();
        res.redirect("/assets");
    } catch (error) {
        await t.rollback();
        console.error("Error returning asset:", error);
        res.status(500).send("Error performing asset return: " + error.message);
    }
};

// Show scrap form
const showScrapForm = async (req, res) => {
    try {
        // Fetch all assets that are in stock (AVAILABLE or UNDER_REPAIR)
        const assets = await Asset.findAll({
            where: {
                status: {
                    [sequelize.Sequelize.Op.in]: ["AVAILABLE", "UNDER_REPAIR"]
                }
            },
            include: [{ model: AssetCategory, as: "category" }],
            order: [["assetCode", "ASC"]]
        });

        res.render("transactions/scrap", { assets });
    } catch (error) {
        console.error("Error loading scrap form:", error);
        res.status(500).send("Error loading asset scrap page.");
    }
};

// Handle asset scrap
const scrapAsset = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { assetId, notes } = req.body;

        if (!assetId) {
            await t.rollback();
            return res.status(400).send("Asset is required.");
        }

        const asset = await Asset.findByPk(assetId);
        if (!asset || asset.status === "SCRAPPED") {
            await t.rollback();
            return res.status(400).send("Selected asset is invalid or already scrapped.");
        }

        // Block scrapping if asset is currently issued to an employee
        if (asset.status === "ISSUED") {
            await t.rollback();
            return res.status(400).send("Cannot scrap an asset that is currently issued to an employee. Please return the asset first.");
        }

        let employeeId = null;

        // Create transaction record
        await AssetTransaction.create({
            assetId,
            employeeId,
            transactionType: "SCRAP",
            notes: notes ? notes.trim() : "",
            transactionDate: new Date()
        }, { transaction: t });

        // Update asset status to SCRAPPED
        await Asset.update(
            { status: "SCRAPPED" },
            { where: { id: assetId }, transaction: t }
        );

        await t.commit();
        res.redirect("/assets");
    } catch (error) {
        await t.rollback();
        console.error("Error scrapping asset:", error);
        res.status(500).send("Error performing asset scrap: " + error.message);
    }
};

module.exports = {
    showIssueForm,
    issueAsset,
    showReturnForm,
    returnAsset,
    showScrapForm,
    scrapAsset,
};

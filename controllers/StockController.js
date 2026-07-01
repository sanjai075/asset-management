const { Op } = require("sequelize");
const Asset = require("../models/Asset");
const AssetCategory = require("../models/AssetCategory");

// Retrieve stock metrics for available assets
const getStockView = async (req, res) => {
    try {
        const search = req.query.search || "";

        // 1. Fetch ALL available assets for overall metrics and branch totals
        const allAvailable = await Asset.findAll({
            where: { status: "AVAILABLE" }
        });

        const branchMap = {};
        let totalAssetValue = 0;

        allAvailable.forEach(asset => {
            const branch = asset.branch || "Unknown";
            const value = parseFloat(asset.value) || 0;

            if (!branchMap[branch]) {
                branchMap[branch] = {
                    branchName: branch,
                    count: 0,
                    totalValue: 0
                };
            }

            branchMap[branch].count += 1;
            branchMap[branch].totalValue += value;
            totalAssetValue += value;
        });

        const branchTotals = Object.values(branchMap);

        // 2. Fetch FILTERED available assets for the detail table
        const whereClause = { status: "AVAILABLE" };
        if (search) {
            whereClause[Op.or] = [
                { make: { [Op.iLike]: `%${search}%` } },
                { model: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const availableAssets = await Asset.findAll({
            where: whereClause,
            include: [{ model: AssetCategory, as: "category" }],
            order: [["id", "ASC"]],
        });

        res.render("stock/index", {
            availableAssets,
            branchTotals,
            totalAssetValue,
            search,
        });
    } catch (error) {
        console.error("Error retrieving stock view:", error);
        res.status(500).send("Something went wrong while retrieving stock metrics.");
    }
};

module.exports = {
    getStockView,
};

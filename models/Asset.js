const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const AssetCategory = require("./AssetCategory");

class Asset extends Model { }

Asset.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        assetCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        serialNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        make: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        purchaseDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        branch: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "AVAILABLE", // AVAILABLE, ISSUED, UNDER_REPAIR, SCRAPPED
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "asset_categories",
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "Asset",
        tableName: "assets",
        timestamps: true,
    }
);

// Define associations
Asset.belongsTo(AssetCategory, { foreignKey: "categoryId", as: "category" });
AssetCategory.hasMany(Asset, { foreignKey: "categoryId", as: "assets" });

module.exports = Asset;

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Asset = require("./Asset");
const Employee = require("./Employee");

class AssetTransaction extends Model { }

AssetTransaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        assetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "assets",
                key: "id",
            },
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "employees",
                key: "id",
            },
        },
        transactionType: {
            type: DataTypes.STRING,
            allowNull: false, // ISSUE, RETURN, SCRAP
        },
        transactionDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true, // For RETURN: Upgrade, Repair, Resignation
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "AssetTransaction",
        tableName: "asset_transactions",
        timestamps: true,
    }
);

// Define associations
AssetTransaction.belongsTo(Asset, { foreignKey: "assetId", as: "asset" });
Asset.hasMany(AssetTransaction, { foreignKey: "assetId", as: "transactions" });

AssetTransaction.belongsTo(Employee, { foreignKey: "employeeId", as: "employee" });
Employee.hasMany(AssetTransaction, { foreignKey: "employeeId", as: "transactions" });

module.exports = AssetTransaction;

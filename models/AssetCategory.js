const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class AssetCategory extends Model { }

AssetCategory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "AssetCategory",
        tableName: "asset_categories",
        timestamps: true,
    }
);

module.exports = AssetCategory;

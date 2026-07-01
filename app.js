const express = require("express");
const path = require("path");
const sequelize = require("./config/database");

// Import models to ensure synchronization and registration
const Employee = require("./models/Employee");
const AssetCategory = require("./models/AssetCategory");
const Asset = require("./models/Asset");
const AssetTransaction = require("./models/AssetTransaction");

// Import routes
const employeeRoutes = require("./routes/employeeRoutes");
const assetCategoryRoutes = require("./routes/assetCategoryRoutes");
const assetRoutes = require("./routes/assetRoutes");
const stockRoutes = require("./routes/stockRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/employees", employeeRoutes);
app.use("/categories", assetCategoryRoutes);
app.use("/assets", assetRoutes);
app.use("/stock", stockRoutes);
app.use("/transactions", transactionRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");

        // Syncs all registered models
        await sequelize.sync();
        console.log("Database synchronized");

        app.listen(3001, () => {
            console.log("Server started on port 3001");
        });
    } catch (error) {
        console.error(error);
    }
};

start();
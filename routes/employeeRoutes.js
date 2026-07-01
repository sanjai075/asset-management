const express = require("express");
const router = express.Router();

const EmployeeController = require("../controllers/EmployeeController");

// Display all employees
router.get("/", EmployeeController.getEmployees);
router.get("/create", EmployeeController.showCreateForm);
router.post("/create", EmployeeController.createEmployee);
router.get("/edit/:id", EmployeeController.showEditForm);
router.post("/edit/:id", EmployeeController.updateEmployee);
router.post("/status/:id", EmployeeController.changeStatus);

module.exports = router;
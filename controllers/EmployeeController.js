const { Op } = require("sequelize");
const Employee = require("../models/Employee");

// Show list
const getEmployees = async (req, res) => {
    try {
        const search = req.query.search || "";
        const status = req.query.status || "";

        const whereClause = {
            [Op.or]: [
                { employeeCode: { [Op.iLike]: `%${search}%` } },
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
            ]
        };

        if (status) {
            whereClause.status = status;
        }

        const employees = await Employee.findAll({
            where: whereClause,
            order: [["id", "ASC"]],
        });

        res.render("employees/index", {
            employees,
            search,
            status,
        });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).send("Something went wrong.");
    }
};

// Show create form
const showCreateForm = async (req, res) => {
    try {
        res.render("employees/create");
    } catch (error) {
        console.error("Error rendering create form:", error);
        res.status(500).send("Error loading create form: " + error.message);
    }
};

// Save employee
const createEmployee = async (req, res) => {
    try {
        const { employeeCode, name, email, phone, department, branch } = req.body;

        await Employee.create({
            employeeCode,
            name,
            email,
            phone,
            department,
            branch
        });

        res.redirect("/employees");
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(400).send("Error creating employee: " + error.message);
    }
};

// Show edit form
const showEditForm = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Employee ID format. ID must be a number.");
    }

    try {
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).send("Employee not found.");
        }

        res.render("employees/edit", { employee });
    } catch (error) {
        console.error("Error fetching employee for edit:", error);
        res.status(500).send("Error fetching employee details: " + error.message);
    }
};

// Update employee details
const updateEmployee = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Employee ID format. ID must be a number.");
    }

    try {
        const { employeeCode, name, email, phone, department, branch } = req.body;

        await Employee.update(
            {
                employeeCode,
                name,
                email,
                phone,
                department,
                branch
            },
            {
                where: { id }
            }
        );

        res.redirect("/employees");
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(400).send("Error updating employee details: " + error.message);
    }
};

// Toggle status between ACTIVE and INACTIVE
const changeStatus = async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).send("Invalid Employee ID format. ID must be a number.");
    }

    try {
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).send("Employee not found");
        }

        const newStatus = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        await Employee.update(
            { status: newStatus },
            { where: { id } }
        );

        res.redirect("/employees");
    } catch (error) {
        console.error("Error changing status:", error);
        res.status(500).send("Error toggling status: " + error.message);
    }
};

module.exports = {
    getEmployees,
    showCreateForm,
    createEmployee,
    showEditForm,
    updateEmployee,
    changeStatus,
};
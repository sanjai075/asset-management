const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Employee extends Model { }

Employee.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        employeeCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Must be a valid email address"
                }
            }
        },
        phone: {
            type: DataTypes.STRING,
        },
        department: {
            type: DataTypes.STRING,
        },
        branch: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "ACTIVE",
        },
    },
    {
        sequelize,
        modelName: "Employee",
        tableName: "employees",
        timestamps: true,
    }
);

module.exports = Employee;
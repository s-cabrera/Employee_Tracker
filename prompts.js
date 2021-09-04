const {getDepartments, getRoles, getManagers, getEmployees} = require('./get');

const menuChoices = [
    "View all Employees", 
    "View all Employees by Department", 
    "View all Employees by Manager", 
    "Add Employee",
    "Add Department",
    "Add Role", 
    "Update Employee Role",
    "Update Employee Manager",
    "View all Roles",
    "Delete Department",
    "Delete Role",
    "Delete Employee",
    "View Budget of Department",
    "Exit"
]

const menuPrompts = [
    
    {
    name: "menu",
    message: "What would you like to do?",
    type: "list",
    choices: menuChoices
    }
]

const addEmployeePrompts = [
    {
        name: "first_name",
        message: "What is the employee's first name?",
        type: "input"
    },
    {
        name: "last_name",
        message: "What is the employee's last name?",
        type: "input"
    },
    {
        name: "role",
        message: "What is the employee's role",
        type: "list",
        choices: getRoles
    },
    {
        name: "manager",
        message: "Select this employee's manager",
        type: "list",
        choices: getEmployees
    }
]

const addRolePrompts = [
    {
        name: "title",
        message: "What is title of the role you wish to add?",
        type: "input"
    },
    {
        name: "salary",
        message: "What is this role's annual salary? (Ex: 100000)",
        type: "input"
    },
    { 
        name: "department",
        message: "What department is this role part of?",
        type: "list",
        choices: getDepartments
    }
];

const addDepartmentPrompts = [
    {
        name: "department",
        message: "What is name of the department you wish to add?",
        type: "input"
    }
];


module.exports = {menuPrompts, addEmployeePrompts, addRolePrompts, addDepartmentPrompts};
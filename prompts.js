const inquirer = require('inquirer');
const viewAllRoles = require('./server');

const menuChoices = [
    "View all Employees", 
    "View all Employees by Department", 
    "View all Employees by Manager", 
    "Add Employee",
    "Add Department",
    "Add Role", 
    "Remove Employee",
    "Update Employee Role",
    "Update Employee Manager",
    "View all Roles",
    "Delete Department",
    "Delete Roles",
    "Delete Employee",
    "View Budget of Department"
]

let roles = [
    "Engineer", 
    "Tech Intern", 
    "Accountant",
    "HR Representative",
    "Sales Representative",
    "Marketing Representative",
    "CEO"
];

let managers = [
    "Stephanie Cabrera", 
    "Tyra Banks",
    "None"
];

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
        choices: roles
    },
    {
        name: "manager",
        message: "",
        type: "list",
        choices: managers
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
        message: "What is this role's annual salary?",
        type: "input"
    },
    { 
        name: "department",
        message: "What department is this role part of?",
        type: "list",
        choices: roles
    }
];

const addDepartmentPrompts = [
    {
        name: "department",
        message: "What is name of the department you wish to add?",
        type: "input"
    }
];

const menu = async() => {
    const res = await inquirer.prompt(menuPrompts);
    switch(res.menu) {

        case "Add Employee":
            await inquirer.prompt(addEmployeePrompts);
        break;

        case "Add Role":
            await inquirer.prompt(addRolePrompts);
        break;

        case "Add Department": 
            await inquirer.prompt(addDepartmentPrompts)
        break;

        case "View all Employees": 
            console.log("View all Employees selected"); 
        break; 
        
        case "View all Employees by Department": 
            console.log("View all Employees by Department selected"); 
        break;

        case "View all Employees by Manager": 
            console.log("View all Employees by Manager selected");
        break; 

        case "Remove Employee": 
            console.log("Remove Employee selected");
        break;

        case "Update Employee Role": 
            console.log("Update Employee Role selected");
        break;

        case "Update Employee Manager": 
            console.log("Update Employee Manager selected");
        break;

        case "View all Roles": 
            console.log("View all Roles selected");
            console.table(await viewAllRoles);
        break;

        case "Delete Department": 
            console.log("Delete Department selected");
        break;

        case "Delete Roles": 
            console.log("Delete Roles selected");
        break;

        case "Delete Employee": 
            console.log("Delete Employee selected");
        break;

        case "View Budget of Department": 
            console.log("View Budget of Department selected");
        break;

        default: 
            console.log("Default");
        break;

    }
}

module.exports = menu();
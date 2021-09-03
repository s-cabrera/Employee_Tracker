const db = require('./config/connection');
const inquirer = require('inquirer');
const { menuPrompts, addEmployeePrompts, addRolePrompts, addDepartmentPrompts } = require('./prompts');
const { getDepartments, getRoles, getEmployees, getManagers, getSalary } = require('./get');
const { viewAllEmployees, viewAllRoles, viewAllEmployeesByDepartment, viewAllEmployeesByManager } = require('./view');
const { deleteDepartment } = require('./delete');


const updateEmployees = async (e) => {

    //Get new role from user input
    console.log(`Employee: ${e}`);
    const new_role = await inquirer.prompt([{
        name: "title",
        message: `Select a new role for ${e.first_name} ${e.last_name}`,
        type: "list",
        choices: await getRoles(),
    }]);

    //Find the id for that new role
    const new_role_data = await new Promise((res, req) => {
        db.query('Select id department_id from role WHERE ?', [{ title: new_role.title }], (err, results) => {
            if (err) { req('Failed to get the new user id') }
            else { res(results[0]) }
        })
    })
    //console.log(`New role id: ${new_role_data.id}`);

    //Change the role_id and department_id for the employee
    await new Promise((res, req) => {
        db.query('UPDATE employee SET ?, ? WHERE ?',
            [
                { role_id: new_role_data.id },
                { department_id: new_role_data.department_id },
                { id: e.id }
            ],
            (err, results) => {
                if (err) { req("Failed to update the employee's role_id and department_id") }
                else { res("Updated employee's role_id and department_id") }
            }
        )
    })
}

const menu = async () => {
    const res = await inquirer.prompt(menuPrompts);
    switch (res.menu) {

        case "Add Employee":
            {
                const employee = await inquirer.prompt(addEmployeePrompts);
                //console.log(employee);

                //Get the id of the role
                const role_id = await new Promise((res, req) => {
                    db.query('SELECT id FROM role WHERE ? ', { title: employee.role }, (err, results) => {
                        if (err) { req('FAILED REQUEST: Role not found'); }
                        else { res(results[0].id) }
                    });
                });
                //console.log(`New role id: ${role_id}`);

                //Get the id of the manager
                let manager_id;
                if (employee.manager != 'None') {
                    const [first, last] = employee.manager.split(" ");
                    manager_id = await new Promise((res, req) => {

                        db.query('SELECT id FROM employee WHERE ? AND ?', [{ first_name: first }, { last_name: last }], (err, results) => {
                            if (err) { console.log(`FAILED REQUEST: No managers with were found`); return true; }
                            else {
                                //console.log(results[0].id);
                                return res(results[0].id);
                            }
                        });
                    });
                };
                //console.log(`New manager id: ${manager_id}`);

                //Insert the new object
                await new Promise((res, req) => {
                    db.query('INSERT INTO employee SET ?',
                        {
                            first_name: employee.first_name,
                            last_name: employee.last_name,
                            role_id: role_id,
                            manager_id: manager_id,
                        },
                        (err, results) => {
                            if (err) { req(`INSERT employee failed`) }
                            else {
                                console.log(`Added ${employee.first_name} ${employee.last_name} as a ${employee.role}.`);
                                res(results);
                            }

                        });
                })
            }
            return true;

        case "Add Role":
            {
                const role = await inquirer.prompt(addRolePrompts);
                //console.log(role);
                department_id = await new Promise((res, req) => {
                    db.query('SELECT id FROM department WHERE ?', { name: role.department }, (err, results) => {
                        if (err) { req('FAILED SELECT REQUEST: department does not exist') }
                        else {
                            //console.log(results);
                            return res(results[0].id);
                        }
                    });
                });
                await new Promise((res, req) => {
                    db.query('INSERT INTO role SET ?',
                        {
                            title: role.title,
                            salary: role.salary,
                            department_id: department_id,
                        },
                        (err, results) => {
                            if (err) req('FAILED INSERT REQUEST: add role');
                            console.log("Role sucessfully added!");
                            return res(results);
                        });
                });
                return true;
            }

        case "Add Department":
            {
                const department = await inquirer.prompt(addDepartmentPrompts);
                await new Promise((res, req) => {
                    db.query('INSERT INTO department SET ?',
                        {
                            name: department.department,
                        },
                        (err, results) => {
                            if (err) req('FAILED INSERT REQUEST: add department');
                            console.log("Department sucessfully added!");
                            return res(results);
                        });
                });
                return true;
            }

        case "View all Employees":
            //console.log("View all Employees selected");
            try {
                console.table(await viewAllEmployees());
                return true;
            } catch (error) {
                process.exit()
            }

        case "View all Employees by Department":
            try {
                const input = await inquirer.prompt([{
                    name: "department",
                    message: "Which department?",
                    type: "list",
                    choices: await getDepartments()
                }]);
                console.table(await viewAllEmployeesByDepartment(input.department));
            } catch (err) {
                throw err;
            }
            return true;

        case "View all Employees by Manager":
            try {
                const input = await inquirer.prompt([{
                    name: "manager",
                    message: "Which manager?",
                    type: "list",
                    choices: await getManagers()
                }]);
                if (input.manager != 'None') console.table(await viewAllEmployeesByManager(input.manager));
                else console.log("No managers found");
            } catch (err) { throw err; }
            return true;


        case "Update Employee Role":
            {
                //console.log("Update Employee Role selected");
                const input = await inquirer.prompt([
                    {
                        name: "employee",
                        message: "Which employee?",
                        type: "list",
                        choices: await getEmployees(),
                    },
                    {
                        name: "role",
                        message: "What role will this employee have?",
                        type: 'list',
                        choices: await getRoles(),
                    }
                ]);
                const role_id = await new Promise((res, req) => {
                    db.query('SELECT id FROM role WHERE ? ', { title: input.role }, (err, results) => {
                        if (err) { req('FAILED REQUEST: Role not found'); }
                        else { res(results[0].id) }
                    });
                });
                //console.log(input, role_id);
                const [first, last] = input.employee.split(" ");
                await new Promise((res, req) => {
                    db.query('UPDATE employee SET ? WHERE ? AND ?',
                        [
                            {
                                role_id: role_id
                            },
                            {
                                first_name: first
                            },
                            {
                                last_name: last
                            }
                        ],
                        (err, results) => {
                            if (err) { req('FAILED REQUEST: Update Employee role') }
                            else {
                                console.log(`Employee ${input.employee} changed roles to a ${input.role}`);
                                res(results);
                            }
                        });
                });
            }
            return true;

        case "Update Employee Manager":
            try {
                //console.log("Update Employee Manager selected");
                const employee = await inquirer.prompt([
                    {
                        name: "employee",
                        message: "Which employee?",
                        type: "list",
                        choices: await getEmployees,
                    }
                ]);
                //console.log(employee);
                const [first, last] = employee.employee.split(" ");
                const role_id = await new Promise((res, req) => {
                    db.query('Select role_id FROM employee WHERE ? AND ?',
                        [
                            { first_name: first },
                            { last_name: last },
                        ]
                        , (err, results) => {
                            if (err) { req(''); }
                            else {
                                return res(results[0].role_id);
                            }
                        })
                })
                //console.log(`Role_id: ${role_id}`);
                const department_id = await new Promise((res, req) => {
                    db.query('Select department_id FROM role WHERE ?', { id: role_id },
                        (err, results) => {
                            if (err) { req(''); }
                            else {
                                return res(results[0].department_id);
                            }
                        })
                })
                //console.log(`department_id: ${department_id}`);
                const roles_by_department = await new Promise((res, req) => {
                    db.query('SELECT id FROM role WHERE ?', { department_id: department_id }, (err, results) => {
                        if (err) { req('Failed Request: get all roles w same department id'); }
                        else { return res(results) }
                    });
                })

                let newRolesString = "(";
                roles_by_department.forEach((e, id) => {
                    if (id < roles_by_department.length - 1) { newRolesString += `${e.id},` }
                    else { newRolesString += `${e.id}` }
                });
                newRolesString += ")";
                //console.log(newRolesString);

                const roles = await new Promise((res, req) => {
                    db.query(`SELECT first_name, last_name FROM employee WHERE role_id IN ${newRolesString}`, (err, results) => {
                        if (err) { req(`Failed Request: Retrieve employees from the same department as ${employee.employee}`) }
                        else { return res(results) }
                    })
                });
                //console.log(roles);
                const managersArray = Array(0);
                roles.forEach((e) => {
                    managersArray.push(`${e.first_name} ${e.last_name}`);
                });
                managersArray.push('None');

                const newManager = await inquirer.prompt(
                    [
                        {
                            name: "manager",
                            message: `Choose one of these employees to be ${employee.employee}'s manager: `,
                            type: "list",
                            choices: managersArray,
                        }
                    ]);

                let manager_id;

                if (newManager.manager != 'None') {
                    const [manager_first, manager_last] = newManager.manager.split(" ");

                    manager_id = await new Promise((res, req) => {
                        db.query('Select id FROM employee WHERE ? AND ?',
                            [
                                { first_name: manager_first },
                                { last_name: manager_last },
                            ]
                            , (err, results) => {
                                if (err) { req(''); }
                                else {
                                    return res(results[0].id);
                                }
                            })
                    });
                } else { manager_id = null; }
                //console.log(manager_id);

                await new Promise((res, req) => {
                    db.query('UPDATE employee SET ? WHERE ? AND ?',
                        [
                            {
                                manager_id: manager_id
                            },
                            {
                                first_name: first
                            },
                            {
                                last_name: last
                            }
                        ],
                        (err, results) => {
                            if (err) { req('FAILED REQUEST: Update Employee role') }
                            else {
                                console.log(`Employee ${employee.employee}'s manager was changed to ${newManager.manager}`);
                                res(results);
                            }
                        });
                });

            } catch (err) { throw err }
            return true;

        case "View all Roles":
            //console.log("View all Roles selected");
            console.table(await viewAllRoles());
            return true;

        case "Delete Department":
            try {
                //console.log("Delete Department selected");
                // Get the role 
                const input = await inquirer.prompt([{
                    name: "department",
                    message: "Which department?",
                    type: "list",
                    choices: await getDepartments,
                }]);
                //console.log(input.department);

                const department_id = await new Promise((res, req) => {
                    db.query('SELECT id FROM department WHERE ?', { name: input.department }, (err, results) => {
                        if (err) { return req(`Failed to get the id for the ${input.department} department`) }
                        else { res(results[0].id) }
                    })
                })
                //console.log(`department_id: ${department_id}`);
                // Get all the roles with the same department_id
                const roles_with_department_id = await new Promise((res, req) => {
                    db.query('SELECT * FROM role WHERE ?',
                        { department_id: department_id },
                        (err, results) => {
                            if (err) { req('Failed Delete Department: failed to retreive the roles with the same department_id') }
                            else { res(results) }
                        });
                });
                //console.log(`roles_with_department_id: ${roles_with_department_id}`);
                if (roles_with_department_id == '') {
                    //If there are no roles assigned to this department, delete the department and return true
                    console.log(`No roles with the same department_id \n Deleting the ${input.department} department!`);
                    await deleteDepartment(department_id, input.department);
                    return true;
                }

                let role_id_string = "";
                roles_with_department_id.forEach((e, index) => { (index < roles_with_department_id.length - 1) ? role_id_string += `${e.id},` : role_id_string += `${e.id}` });

                //Get all the employees with that department
                const employees_with_role_id = await new Promise((res, req) => {
                    db.query(`SELECT * FROM employee WHERE role_id IN (${role_id_string})`, (err, results) => {
                        if (err) { return res(`FAILED REQUEST: No employees were found for the ${input} department`) }
                        else {
                            return res(results);
                        }
                    });
                })

                //Delete the roles
                await roles_with_department_id.forEach(async (e) => {
                    try {
                        await new Promise((res, req) => {
                            db.query('DELETE FROM role WHERE ?',
                                { department_id: department_id },
                                (err, results) => {
                                    if (err) { req(`Delete role in the ${input.department} failed`); }
                                    else {
                                        console.log(`The ${e.title} role successfully deleted`);
                                        res(`${e.title} deleted`)
                                    }
                                });
                        });
                    } catch (err) { throw err }
                });

                //Change the roles for each of these employees
                for (let e in employees_with_role_id) {
                    try {
                        const employee = employees_with_role_id[e];

                        const new_role = await inquirer.prompt([{
                            name: "title",
                            message: `Select a new role for ${employee.first_name} ${employee.last_name}`,
                            type: "list",
                            choices: await getRoles(),
                        }]);


                        //Find the id for that new role
                        const new_role_id = await new Promise((res, req) => {
                            db.query('Select id from role WHERE ?', [{ title: new_role.title }], (err, results) => {
                                if (err) { req('Failed to get the new user id') }
                                else {
                                    return res(results[0].id)
                                }
                            })
                        })

                        //Change the role_id for the employee
                        await new Promise((res, req) => {
                            try {
                                db.query('UPDATE employee SET ? WHERE ?',
                                    [
                                        { role_id: new_role_id },
                                        //{ manager_id: null },
                                        { id: employee.id }
                                    ],
                                    (err, results) => {
                                        if (err) { req("Failed to update the employee's role_id and department_id") }
                                        else { res("Updated employee's role_id and manager_id") }
                                    }
                                )
                            } catch (err) { console.log("Failed to update the employee's role_id and department_id"); }
                        })

                    } catch (err) { throw err }
                }

                //Delete the department now that the employees have been reassigned
                await deleteDepartment(department_id, input.department);
            } catch (err) { throw err }
            return true;

        case "Delete Role":
            try {
                //console.log("Delete Roles selected");
                // Get the role 
                const input = await inquirer.prompt([{
                    name: "role",
                    message: "Which role?",
                    type: "list",
                    choices: await getRoles,
                }]);
                //console.log(input.role);
                //Get the role_id for this role
                role_id = await new Promise((res, req) => {
                    db.query('SELECT id FROM role WHERE ?', { title: input.role }, (err, results) => {
                        if (err) { req("Failed Delete Role: failed to retreive the role_id") }
                        else {
                            //console.log(results[0].id);
                            res(results[0].id)
                        }
                    })
                });

                // Get all the employees with the same role_id
                employees_with_role_id = await new Promise((res, req) => {
                    db.query('SELECT id, first_name, last_name FROM employee WHERE ?',
                        { role_id: role_id },
                        (err, results) => {
                            if (err) { req('Failed Delete Role: failed to retreive the employees with the same role_id') }
                            else { res(results) }
                        });
                });

                //Delete the role
                await new Promise((res, req) => {
                    db.query('DELETE FROM role WHERE ?',
                        { id: role_id },
                        (err, results) => {
                            if (err) { req("Delete Employee failed"); }
                            else {
                                console.log(`${input.role} deleted`);
                                res(`${input.role} deleted`)
                            }
                        });
                });

                //Change the roles for each of these employees
                for (let e in employees_with_role_id) {
                    try {
                        const employee = employees_with_role_id[e];

                        const new_role = await inquirer.prompt([{
                            name: "title",
                            message: `Select a new role for ${employee.first_name} ${employee.last_name}`,
                            type: "list",
                            choices: await getRoles(),
                        }]);


                        //Find the id for that new role
                        const new_role_id = await new Promise((res, req) => {
                            db.query('Select id from role WHERE ?', [{ title: new_role.title }], (err, results) => {
                                if (err) { req('Failed to get the new user id') }
                                else {
                                    return res(results[0].id)
                                }
                            })
                        })

                        //Change the role_id for the employee
                        await new Promise((res, req) => {
                            try {
                                db.query('UPDATE employee SET ? WHERE ?',
                                    [
                                        { role_id: new_role_id },
                                        //{ manager_id: null },
                                        { id: employee.id }
                                    ],
                                    (err, results) => {
                                        if (err) { req("Failed to update the employee's role_id and department_id") }
                                        else { res("Updated employee's role_id and manager_id") }
                                    }
                                )
                            } catch (err) { console.log("Failed to update the employee's role_id and department_id"); }
                        })
                    }catch(err){throw err}
                }      

            } catch (err) { throw err }

            return true;

        case "Delete Employee":
            try {
                console.log("Delete Employee selected");
                const input = await inquirer.prompt([{
                    name: "employee",
                    message: "Which employee?",
                    type: "list",
                    choices: await getEmployees,
                }]);

                const [first, last] = input.employee.split(" ");

                await new Promise((res, req) => {
                    db.query('DELETE FROM employee WHERE ? AND ?',
                        [
                            { first_name: first },
                            { last_name: last },
                        ],
                        (err, results) => {
                            if (err) { req("Delete Employee failed"); }
                            else {
                                console.log(`${first} ${last} deleted`);
                                res(`${first} ${last} deleted`)
                            }
                        });
                });
                console.table(await viewAllEmployees());
            } catch (err) { throw err }
            return true;
        case "View Budget of Department":
            try {
                //console.log("View Budget of Department selected");
                //Get user input for the department
                const input = await inquirer.prompt([{
                    name: "department",
                    message: "Which department?",
                    type: "list",
                    choices: await getDepartments()
                }]);

                //This returns all of the employees from a department
                const employees = await viewAllEmployeesByDepartment(input.department);
                if (employees == 'FAILED REQUEST: No roles were found for the Human Resource department') {
                    console.log(`\nNo employees in the ${input.department} department.\nBudget is $0 \n`);
                    return true;
                }

                //Array of objects
                let pay_roll = new Object;
                //console.log(pay_roll);

                employees.forEach((e) => {
                    let role = e.role_id;
                    // console.log(`${e.first_name} ${e.last_name}`);
                    // console.log(`role_id: ${role}`);
                    role.toString();
                    if (!pay_roll.hasOwnProperty(role)) {
                        //If the role_id is not defined, add it to the array.
                        pay_roll[role] = { count: 1 };
                        //console.log(`Count: ${pay_roll[role].count}`);
                    }
                    else {
                        //Increment the count value
                        pay_roll[role].count++;
                        //console.log(`Count: ${pay_roll[role].count}`);
                    }

                })
                //console.log(pay_roll);

                let total = 0;
                for (const index in pay_roll) {
                    const salary = await new Promise((res, req) => {
                        db.query('Select salary from role WHERE ?', { id: index }, (err, results) => {
                            if (err) { req('Failed to get the salary for this role') }
                            else { res(results[0].salary) }
                        })
                    })

                    //console.log(`Salary: ${salary}`);

                    for (const count in pay_roll[index]) {
                        total += (salary * pay_roll[index][count]);
                    }
                }

                console.log(`\n The budget for the ${input.department} department is $${total} \n`);
                return true;

            } catch (error) { throw error }

        case "Exit":
            return false;

        default:
            console.log("Default");
            return true;

    }
}

module.exports = { menu };
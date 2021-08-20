const express = require('express');
const db = require('./config/connection');
const inquirer = require('inquirer');
// const prompts = require('./prompts.js');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const viewAllEmployees = async() => {
    return new Promise((res, req) => {
        db.query('SELECT * FROM employee', (err, results) =>  {
            if(err){req('FAILED REQUEST: view all employees')}
            return res(results);
        });
    })
};

const viewAllRoles = async() => {
    return new Promise((res, req) => {
        db.query('SELECT * FROM role', (err, results) =>  {
            if(err){req('FAILED REQUEST: view all roles')}
            return res(results);
        });
    })
};

const viewAllEmployeesByDepartment = async(input) => {
    console.log(`Input: ${input}`);
    const id = await new Promise((res, req) => {
        db.query('SELECT id FROM department WHERE ?',{name: input},(err, results) =>{
            if(err){req(`FAILED REQUEST: ${input} department not found`)}
            else{
                return res(results[0].id);
            }
        });
    });
    const roles_id = await new Promise((res, req) => {
        db.query('SELECT id FROM role WHERE ?', {department_id: id}, (err, results) => {
            if(err){req(`FAILED REQUEST: No roles were found for the ${input} department`)}
            else{
                let roles = Array(0); 
                results.forEach((element)=>{roles.push(element.id)}); 
                return res(roles);}
        });
    });
    let role_id_string = "";
    roles_id.forEach((e, index) => {(index < roles_id.length - 1)?role_id_string +=`${e},`:role_id_string +=`${e}`});

    
    return await new Promise((res, req) => {
       db.query(`SELECT * FROM employee WHERE role_id IN (${role_id_string})`, (err, results) => {
            if(err){req(`FAILED REQUEST: No employees were found for the ${input} department`)}
            else{
                return res(results);
            }
       });
    });
}  

const viewAllEmployeesByManager = async(input) => {
    //console.log(`${input}`);
    const [first, last] = input.split(" ");
    //console.log(`First name: ${first}; Last name: ${last};`);
    const manager_id = await new Promise((res,req) => {
        db.query('SELECT id FROM employee WHERE ? AND ?', [{first_name: first}, {last_name: last}], (err, results) => {
            if(err){req(`FAILED REQUEST: No managers named ${input} were found`)}
            else{
                return res(results[0].id);
            }
        });
    });
    //console.log(`Manager ID: ${manager_id}`);

    return await new Promise((res,req) => {
        db.query('SELECT * FROM employee WHERE ?', {manager_id: manager_id}, (err, results) => {
            if(err){req(`FAILED REQUEST: No employees with ${input} as their manager were found`)}
            else{
                return res(results);
            }
        });
    });
};



const getDepartments  = async() => {
    const departments = await new Promise((res, req) => {
        db.query('SELECT name FROM department', (err, results) => 
            {
            if(err)req(err)
            else{return res(results)}
        });
    });
    let newDepartmentArray = Array(0);
    departments.forEach((e) => {
        newDepartmentArray.push(e.name);
    })
    return newDepartmentArray;
}

const getRoles  = async() => {
    const roles = await new Promise((res, req) => {
        db.query('SELECT title FROM role', (err, results) => 
            {
            if(err)req(err)
            else{return res(results)}
        });
    });
    let newRoleArray = Array(0);
    roles.forEach((e) => {
        newRoleArray.push(e.title);
    })
    return newRoleArray;
}

const getEmployees = async() => {
    const employee = await new Promise((res, req) => {
        db.query('SELECT first_name, last_name FROM employee', (err, results) => 
            {
            if(err)req(err)
            
            else{console.log(results);return res(results)}
        });
    });
    let newEmployeeArray = Array(0);
    employee.forEach((e) => {
        newEmployeeArray.push(`${e.first_name} ${e.last_name}`);
    })
    return newEmployeeArray;
}

const getManagers = async() => {
    const managersData = await new Promise((res, req) => {
        db.query('SELECT id FROM employee WHERE manager_id IS NOT NULL', (err, results) => 
        {
            if(err){req(err)}
            else{console.log(results);return res(results)}
        });
    });
    console.log(managersData);
    let newManagerArray = Array(0);
    
    managersData.forEach((e) => {
        if(!newManagerArray.includes(e.id)){
            newManagerArray.push(e.id);
        }
    })

    

    newManagerArray.push('None');
    return newManagerArray;
}

//Inquirer

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
    "Delete Roles",
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
        choices: getRoles,
    },
    {
        name: "manager",
        message: "Who is this employee's manager?",
        type: "list",
        choices: getEmployees,
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
        choices: getDepartments,
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
        {
            const employee = await inquirer.prompt(addEmployeePrompts);
            //Get the id of the role
            console.log(employee);
            const role_id = await new Promise((res, req) => {
                db.query('SELECT id FROM role WHERE ? ', {title: employee.role}, (err, results) => {
                    if(err){req('FAILED REQUEST: Role not found');}
                    else{res(results[0].id)}
                });
            });
            console.log(`New role id: ${role_id}`);
            //Get the id of the manager
            let manager_id;
            if(employee.manager != 'None'){
                const [first, last] = employee.manager.split(" ");
                manager_id = await new Promise((res,req) => {

                    db.query('SELECT id FROM employee WHERE ? AND ?', [{first_name: first}, {last_name: last}], (err, results) => {
                        if(err){req(`FAILED REQUEST: No managers with were found`)}
                        else{
                            //console.log(results[0].id);
                            return res(results[0].id);
                        }
                    });
                });
            }
            console.log(`New manager id: ${manager_id}`);
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
                    if(err){req(`INSERT employee failed`)}
                    else{
                        console.log("Added new employee");
                        res(results);
                    }

                });
            })
        }
        return true;
        break;

        case "Add Role":
        {
            const role = await inquirer.prompt(addRolePrompts); 
            console.log(role);
            department_id = await new Promise((res, req) => {
                db.query('SELECT id FROM department WHERE ?', {name: role.department}, (err, results)=> {
                    if(err){req('FAILED SELECT REQUEST: department does not exist')}
                    else
                    {
                        console.log(results);
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
                    if(err)req('FAILED INSERT REQUEST: add role');
                    console.log("Role sucessfully added!");
                    return res(results);
                });
            });
            return true;
        }
        break;

        case "Add Department": 
        {
            const department = await inquirer.prompt(addDepartmentPrompts);
            await new Promise((res, req) => {
                db.query('INSERT INTO department SET ?', 
                {
                    name: department.department,
                },
                (err, results) => {
                    if(err)req('FAILED INSERT REQUEST: add department');
                    console.log("Department sucessfully added!");
                    return res(results);
                });
            });
            return true;
        }

        case "View all Employees": 
            console.log("View all Employees selected");
            console.table(await viewAllEmployees()); 
            return true;
        break; 
        
        case "View all Employees by Department": 
            try{
            const input = await inquirer.prompt([{
                name: "department",
                message: "Which department?",
                type: "list",
                choices: await getDepartments()
            }]); 
            console.table(await viewAllEmployeesByDepartment(input.department));
            }catch(err){
                throw err;
            }
            return true;
        break;

        case "View all Employees by Manager": 
            //console.log("View all Employees by Manager selected");
            const input = await inquirer.prompt([{
                name: "manager",
                message: "Which manager?",
                type: "list",
                choices: await getManagers
            }]); 
            if(input.manager != 'None')console.table(await viewAllEmployeesByManager(input.manager));
            else console.log("No managers found");
            return true;
        break; 

        case "Update Employee Role": 
        {
            console.log("Update Employee Role selected");
            const input = await inquirer.prompt([
                {
                    name: "employee",
                    message: "Which employee?",
                    type: "list",
                    choices: await getEmployees,
                },
                {
                    name: "role",
                    message: "What role will this employee have?",
                    type: 'list',
                    choices: await getRoles,
                }
            ]);
            const role_id = await new Promise((res, req) => {
                db.query('SELECT id FROM role WHERE ? ', {title: input.role}, (err, results) => {
                    if(err){req('FAILED REQUEST: Role not found');}
                    else{res(results[0].id)}
                });
            });
            console.log(input, role_id);
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
                    if(err){req('FAILED REQUEST: Update Employee role')}
                    else{
                        console.log(`Employee ${input.employee} changed roles to a ${input.role}`);
                        res(results);
                    }
                });
            });
        }
        return true;
        break;

        case "Update Employee Manager": 
        {
            console.log("Update Employee Manager selected");
            const employee = await inquirer.prompt([
                {
                    name: "employee",
                    message: "Which employee?",
                    type: "list",
                    choices: await getEmployees,
                }
            ]); 
            console.log(employee);
            const [first, last] = employee.employee.split(" ");
            const role_id = await new Promise((res, req) => {
                db.query('Select role_id FROM employee WHERE ? AND ?',
                [
                    {first_name: first},
                    {last_name: last},
                ]    
                , (err, results) => {
                    if(err){req('');}
                    else{
                        return res(results[0].role_id);
                    }
                })
            })
            console.log(`Role_id: ${role_id}`);
            const department_id = await new Promise((res, req) => {
                db.query('Select department_id FROM role WHERE ?', {id: role_id}, 
                (err, results) => {
                    if(err){req('');}
                    else{
                        return res(results[0].department_id);
                    }
                })
            })
            console.log(`department_id: ${department_id}`);
            const roles_by_department = await new Promise((res, req) => {
                db.query('SELECT id FROM role WHERE ?', {department_id: department_id}, (err, results) => {
                    if(err){req('Failed Request: get all roles w same department id');}
                    else{return res(results)}
                });
            })
    
            let newRolesString= "(";
            roles_by_department.forEach((e, id) => { 
                if(id < roles_by_department.length - 1){newRolesString += `${e.id},`} 
                else{newRolesString += `${e.id}`}
            });
            newRolesString += ")";
            console.log(newRolesString);

            const roles = await new Promise((res, req) => {
                db.query(`SELECT first_name, last_name FROM employee WHERE role_id IN ${newRolesString}`, (err, results) => {
                    if(err){req(`Failed Request: Retrieve employees from the same department as ${employee.employee}`)}
                    else{return res(results)}
                }) 
            });
            console.log(roles);
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
            
            if(newManager.manager != 'None'){
                const [manager_first, manager_last] = newManager.manager.split(" ");            

                const manager_id = await new Promise((res, req) => {
                    db.query('Select id FROM employee WHERE ? AND ?',
                    [
                        {first_name: manager_first},
                        {last_name: manager_last},
                    ]    
                    , (err, results) => {
                        if(err){req('');}
                        else{
                            return res(results[0].id);
                        }
                    })
                });
            }else{ manager_id = null;}    
            console.log(manager_id);

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
                    if(err){req('FAILED REQUEST: Update Employee role')}
                    else{
                        console.log(`Employee ${employee.employee}'s manager was changed to ${newManager.manager}`);
                        res(results);
                    }
                });
            });

        }
        return true;
        break;

        case "View all Roles": 
            console.log("View all Roles selected");
            console.table(await viewAllRoles());
            return true;
        break;

        case "Delete Department": 
            console.log("Delete Department selected");
            return true;
        break;

        case "Delete Roles": 
            console.log("Delete Roles selected");
            return true;
        break;

        case "Delete Employee": 
        {
            console.log("Delete Employee selected");
            const input = await inquirer.prompt([{
                name: "employee",
                message: "Which employee?",
                type: "list",
                choices: await getEmployees,
            }]); 
    
            const [first, last] = input.employee.split(" ");

            await new Promise((res, req) => {
                db.query('DELETE FROM employee WHERE ? AND ?' , 
                [
                    {first_name: first},
                    {last_name: last},
                ], 
                (err, results) => {
                    if(err){req("Delete Employee failed");}
                    else{
                        console.log(`${first} ${last} deleted`);
                        res(`${first} ${last} deleted`)
                    }
                });
            });
            console.table(await viewAllEmployees()); 
            return true;
        }
        break;

        case "View Budget of Department": 
            console.log("View Budget of Department selected");
            return true;
        break;

        case "Exit":
            return false; 
        break;

        default: 
            console.log("Default");
            return true;
        break;

    }
}

const menuCall = async() => {
    if(await menu()){menuCall()};
    console.log("Use Ctrl + C to stop the terminal from running");
}

//APP methods
app.use((req, res) => {
    res.status(404).end();
});

app.listen(PORT, async() => {
    console.log(`Server running on port ${PORT}`);
    menuCall();
});

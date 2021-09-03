const db = require('./config/connection');

const getDepartments = async () => {
    const departments = await new Promise((res, req) => {
        db.query('SELECT name FROM department', (err, results) => {
            if (err) req(err)
            else { return res(results) }
        });
    });
    let newDepartmentArray = Array(0);
    departments.forEach((e) => {
        newDepartmentArray.push(e.name);
    })
    return newDepartmentArray;
}

const getRoles = async () => {
    const roles = await new Promise((res, req) => {
        db.query('SELECT title FROM role', (err, results) => {
            if (err) req(err)
            else { return res(results) }
        });
    });
    let newRoleArray = Array(0);
    roles.forEach((e) => {
        newRoleArray.push(e.title);
    })
    return newRoleArray;
}

const getEmployees = async () => {
    const employee = await new Promise((res, req) => {
        db.query('SELECT first_name, last_name FROM employee', (err, results) => {
            if (err) req(err)

            else { return res(results) }
        });
    });
    let newEmployeeArray = Array(0);
    employee.forEach((e) => {
        newEmployeeArray.push(`${e.first_name} ${e.last_name}`);
    })
    return newEmployeeArray;
}

const getManagers = async () => {
    const managerIds = await new Promise((res, req) => {
        db.query('SELECT manager_id FROM employee WHERE manager_id IS NOT NULL', (err, results) => {
            if (err) { req(err) }
            else { return res(results) }
        });
    });
    //console.log(managerIds);
    let managerIdsArray = "(";

    managerIds.forEach((e, i) => {
        if (!managerIdsArray.includes(`${e.manager_id}`) && i < managerIds.length - 1) {
            managerIdsArray += `${e.manager_id}, `;
        }
        else if (!managerIdsArray.includes(`${e.manager_id}`) && i == managerIds.length - 1) {
            managerIdsArray += `${e.manager_id})`;
        }
    })

    //console.log(managerIdsArray);

    //Get the names of these managers
    const managers = await new Promise((res, req) => {
        db.query(`SELECT first_name, last_name FROM employee WHERE id IN ${managerIdsArray}`,
            (err, results) => {
                if (err) { req(err) }
                else { return res(results) }
            });
    });

    let newManagerArray = Array(0);

    managers.forEach((e) => {
        newManagerArray.push(`${e.first_name} ${e.last_name}`);
    })

    //console.log(newManagerArray);
    newManagerArray.push('None');

    return newManagerArray;
}

const getSalary = async(id) => {
    return await new Promise ((res, req) => {
        db.query('SELECT salary FROM role WHERE ?', {id: id}, () => {
            if(err){req(`FAILED REQUEST: getting salary for role with id ${id}`)}
            else{
                console.log(results[0].salary);
                return res(results[0].salary);
            }
        })
    })
}

module.exports = {getDepartments, getRoles, getEmployees, getManagers, getSalary};
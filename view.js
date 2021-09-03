const db = require('./config/connection');

const viewAllEmployees = async () => {
    return new Promise((res, req) => {
        db.query('SELECT * FROM employee', (err, results) => {
            if (err) { req('FAILED REQUEST: view all employees') }
            return res(results);
        });
    })
};

const viewAllRoles = async () => {
    return new Promise((res, req) => {
        db.query('SELECT * FROM role', (err, results) => {
            if (err) { req('FAILED REQUEST: view all roles') }
            return res(results);
        });
    })
};

const viewAllEmployeesByDepartment = async (input) => {
    //console.log(`Input: ${input}`);
    const id = await new Promise((res, req) => {
        db.query('SELECT id FROM department WHERE ?', { name: input }, (err, results) => {
            if (err) { return res(`FAILED REQUEST: ${input} department not found`) }
            else {
                return res(results[0].id);
            }
        });
    });
    //console.log(`id ${id}`);
    const roles_id = await new Promise((res, req) => {
        db.query('SELECT id FROM role WHERE ?', { department_id: id }, (err, results) => {
            if (err) {
                return res(`FAILED REQUEST: No roles were found for the ${input} department`)
            }
            else {
                let roles = Array(0);
                results.forEach((element) => { roles.push(element.id) });
                return res(roles);
            }
        })
    });
    //console.log(`roles_id: ${roles_id}`);
    if (roles_id == ``) {
        return `FAILED REQUEST: No roles were found for the ${input} department`;
    }

    let role_id_string = "";
    roles_id.forEach((e, index) => { (index < roles_id.length - 1) ? role_id_string += `${e},` : role_id_string += `${e}` });


    return await new Promise((res, req) => {
        db.query(`SELECT * FROM employee WHERE role_id IN (${role_id_string})`, (err, results) => {
            if (err) { res(`FAILED REQUEST: No employees were found for the ${input} department`) }
            else {
                return res(results);
            }
        });
    });
}

const viewAllEmployeesByManager = async (input) => {
    //console.log(`${input}`);
    const [first, last] = input.split(" ");
    //console.log(`First name: ${first}; Last name: ${last};`);
    const manager_id = await new Promise((res, req) => {
        db.query('SELECT id FROM employee WHERE ? AND ?', [{ first_name: first }, { last_name: last }], (err, results) => {
            if (err) { req(`FAILED REQUEST: No managers named ${input} were found`) }
            else {
                return res(results[0].id);
            }
        });
    });
    //console.log(`Manager ID: ${manager_id}`);

    return await new Promise((res, req) => {
        db.query('SELECT * FROM employee WHERE ?', { manager_id: manager_id }, (err, results) => {
            if (err) { req(`FAILED REQUEST: No employees with ${input} as their manager were found`) }
            else {
                return res(results);
            }
        });
    });
};

module.exports = {viewAllEmployees, viewAllRoles, viewAllEmployeesByDepartment, viewAllEmployeesByManager}
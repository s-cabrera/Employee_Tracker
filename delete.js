const db = require('./config/connection');

// Delete department with department_id
const deleteDepartment = async(department_id, department) => {
    await new Promise((res, req) => {
        db.query('DELETE FROM department WHERE ?', { id: department_id }, (err, results) => {
            if (err) { req('Failed to delete department') }
            else {
                console.log(`${department} department deleted`);
                res(`${department} department deleted`)
            }
        })
    })
}

module.exports = {deleteDepartment};
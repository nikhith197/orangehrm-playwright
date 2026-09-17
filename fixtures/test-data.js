const fs = require('fs');
const path = require('path');

function getEmployeeData() {
  const file = path.join(__dirname, '..', 'data', 'employee.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const timestamp = Date.now().toString().slice(-8);
  return {
    ...data,
    employeeId: data.employeeId.replace('${timestamp}', timestamp),
    profilePicture: path.join(__dirname, '..', data.profilePicture)
  };
}

module.exports = { getEmployeeData };

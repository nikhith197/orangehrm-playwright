class EmployeeApi {
  constructor(request) {
    this.request = request;
  }

  async getEmployeeByNumber(empNumber) {
    return this.request.get(
      `/web/index.php/api/v2/pim/employees/${empNumber}`,
      {
        params: {
          model: 'detailed'
        }
      }
    );
  }
}

module.exports = { EmployeeApi };
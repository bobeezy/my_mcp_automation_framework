const { callApiWithReport } = require('../utils/apiReporter');

class UserApiClient {
  constructor({ request, testInfo }) {
    this.request = request;
    this.testInfo = testInfo;
  }

  async createUser(data) {
    return callApiWithReport({
      requestContext: this.request,
      method: 'POST',
      url: '/users/add',
      headers: { 'Content-Type': 'application/json' },
      data,
      testInfo: this.testInfo,
      name: 'api-user-create'
    });
  }

  async getUser(id) {
    return callApiWithReport({
      requestContext: this.request,
      method: 'GET',
      url: `/users/${id}`,
      testInfo: this.testInfo,
      name: 'api-user-read'
    });
  }

  async updateUser(id, data) {
    return callApiWithReport({
      requestContext: this.request,
      method: 'PUT',
      url: `/users/${id}`,
      headers: { 'Content-Type': 'application/json' },
      data,
      testInfo: this.testInfo,
      name: 'api-user-update'
    });
  }

  async deleteUser(id) {
    return callApiWithReport({
      requestContext: this.request,
      method: 'DELETE',
      url: `/users/${id}`,
      testInfo: this.testInfo,
      name: 'api-user-delete'
    });
  }
}

module.exports = { UserApiClient };

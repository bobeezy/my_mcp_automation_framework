const { callApiWithReport } = require('../utils/apiReporter');

class AuthApiClient {
  constructor({ request, testInfo }) {
    this.request = request;
    this.testInfo = testInfo;
  }

  async login({ username, password }) {
    return callApiWithReport({
      requestContext: this.request,
      method: 'POST',
      url: '/auth/login',
      headers: { 'Content-Type': 'application/json' },
      data: { username, password },
      testInfo: this.testInfo,
      name: 'api-login'
    });
  }
}

module.exports = { AuthApiClient };

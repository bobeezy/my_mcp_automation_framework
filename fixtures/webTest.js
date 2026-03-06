const { test: base, expect } = require('@playwright/test');
const { WebHooks } = require('../hooks/WebHooks');

const test = base;
WebHooks.register(test);

module.exports = {
  test,
  expect
};

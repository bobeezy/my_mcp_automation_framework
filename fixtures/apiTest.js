const { test: base, expect } = require('@playwright/test');
const { ApiHooks } = require('../hooks/ApiHooks');

const test = base;
ApiHooks.register(test);

module.exports = {
  test,
  expect
};

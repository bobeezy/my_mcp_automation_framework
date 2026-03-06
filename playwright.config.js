// @ts-check
const { defineConfig } = require('@playwright/test');
require('dotenv').config({
  path: process.env.ENV_FILE || 'data/credentials/.env.credentials'
});

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { detail: true, suiteTitle: false }]
  ],
  use: {
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'web-chromium',
      testDir: './tests/web',
      use: {
        browserName: 'chromium',
        baseURL: process.env.WEB_BASE_URL || 'https://the-internet.herokuapp.com'
      }
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://dummyjson.com'
      }
    }
  ]
});

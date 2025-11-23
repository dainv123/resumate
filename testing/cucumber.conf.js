const { setWorldConstructor } = require('@cucumber/cucumber');
const { TestWorld } = require('./src/core/TestWorld');

setWorldConstructor(TestWorld);

module.exports = {
  default: {
    require: [
      'src/steps/**/*.ts',
      'src/config/hooks.ts'
    ],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: [
      'src/features/**/*.feature'
    ],
    requireModule: [
      'ts-node/register'
    ],
    worldParameters: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000'
    },
    timeout: 60000,
    parallel: 2,
    retry: 2,
    retryTagFilter: '@flaky',
    strict: true
  }
};

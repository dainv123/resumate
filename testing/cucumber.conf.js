const { setWorldConstructor } = require('@cucumber/cucumber');
const { TestWorld } = require('./src/core/TestWorld');

setWorldConstructor(TestWorld);

module.exports = {
  default: {
    require: [
      'dist/steps/**/*.js',
      'dist/config/hooks.js'
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
      ['ts-node/register', {
        project: 'tsconfig.cucumber.json'
      }]
    ],
    worldParameters: {
      baseURL: process.env.BASE_URL || 'http://localhost:5005',
      apiURL: process.env.API_URL || 'http://localhost:5001',
      headless: process.env.HEADLESS === 'true',
      ci: process.env.CI === 'true',
      slowMo: parseInt(process.env.SLOW_MO) || 0,
      recordVideo: process.env.RECORD_VIDEO === 'true',
      prewarmBrowser: process.env.PREWARM_BROWSER === 'true'
    },
    timeout: 60000,
    parallel: 2,
    retry: 2,
    retryTagFilter: '@flaky',
    strict: true
  }
};

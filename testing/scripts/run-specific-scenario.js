const { exec } = require('child_process');

// Get arguments from command line
const featureFile = process.argv[2];
const scenarioName = process.argv[3];

if (!featureFile || !scenarioName) {
  console.error('Usage: node run-specific-scenario.js <feature-file> <scenario-name>');
  process.exit(1);
}

const command = `tsx node_modules/.bin/cucumber-js --require src/steps/**/*.ts --require src/config/hooks.ts --format json:reports/results.json --name "${scenarioName}" ${featureFile}`;

console.log(`Running scenario: ${scenarioName}`);
console.log(`From feature: ${featureFile}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }

  console.log('Test completed successfully');
  console.log('Output:', stdout);
});

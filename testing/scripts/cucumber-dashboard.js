const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Serve dashboard HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Get test results
app.get('/api/results', async (req, res) => {
  try {
    const data = await fs.readFile('reports/results.json', 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json([]);
  }
});

// Run specific scenario
app.post('/api/run-scenario', (req, res) => {
  const { featureFile, scenarioName } = req.body;

  const command = `tsx node_modules/.bin/cucumber-js --require src/steps/**/*.ts --require src/config/hooks.ts --format json:reports/results.json --name "${scenarioName}" ${featureFile}`;

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout,
      error: stderr
    });
  });
});

// Run by tags
app.post('/api/run-tags', (req, res) => {
  const { tags } = req.body;

  const command = `tsx node_modules/.bin/cucumber-js --require src/steps/**/*.ts --require src/config/hooks.ts --format json:reports/results.json --tags "${tags}" src/features/**/*.feature`;

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout,
      error: stderr
    });
  });
});

// Run initial test suite
app.post('/api/run-initial', (req, res) => {
  const command = `tsx node_modules/.bin/cucumber-js --require src/steps/**/*.ts --require src/config/hooks.ts --format json:reports/results.json src/features/**/*.feature`;

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout,
      error: stderr
    });
  });
});

// Run npm script
app.post('/api/run-script', (req, res) => {
  const { scriptName, args } = req.body;

  if (!scriptName) {
    return res.status(400).json({ error: 'Script name required' });
  }

  let command = `npm run ${scriptName}`;
  if (args && args.length > 0) {
    // Append args to the command (npm run script arg1 arg2 ...)
    command += ' ' + args.join(' ');
  }

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout,
      error: stderr,
      script: scriptName,
      args: args
    });
  });
});

// Run specific scenario from feature file
app.post('/api/run-scenario-file', (req, res) => {
  const { featureFile, scenarioName } = req.body;

  if (!featureFile || !scenarioName) {
    return res.status(400).json({ error: 'Feature file and scenario name required' });
  }

  // Use relative path from src/features
  const relativePath = featureFile.startsWith('src/features/') ? featureFile : `src/features/${featureFile}`;
  const command = `tsx node_modules/.bin/cucumber-js --require src/steps/**/*.ts --require src/config/hooks.ts --format json:reports/results.json --name "${scenarioName}" ${relativePath}`;

  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      output: stdout,
      error: stderr,
      featureFile: featureFile,
      scenarioName: scenarioName
    });
  });
});

// Get available scripts
app.get('/api/scripts', (req, res) => {
  res.json({
    scripts: [
      { name: 'cucumber:features:json', description: 'Run full test suite & save results', icon: '🎯' },
      { name: 'cucumber:smoke', description: 'Run smoke tests only', icon: '🚀' },
      { name: 'cucumber:regression', description: 'Run regression tests', icon: '🔄' },
      { name: 'cucumber:lint', description: 'Run ESLint checks', icon: '🔍' },
      { name: 'cucumber:type-check', description: 'Run TypeScript type check', icon: '📝' },
      { name: 'cucumber:features:json', description: 'Generate JSON test results', icon: '📊' }
    ]
  });
});

// Get all features and scenarios with results mapped
app.get('/api/features-with-results', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const featuresDir = path.join(__dirname, '../src/features');
    const resultsPath = path.join(__dirname, '../reports/results.json');

    // Load results if available
    let resultsData = [];
    try {
      const resultsContent = await fs.readFile(resultsPath, 'utf8');
      resultsData = JSON.parse(resultsContent);
    } catch (error) {
      // No results file, that's OK
    }

    // Create results map for quick lookup
    const resultsMap = new Map();
    resultsData.forEach(feature => {
      if (feature.elements) {
        feature.elements.forEach(scenario => {
          const key = `${feature.uri}:${scenario.name}`;

          // Calculate scenario status from steps
          let scenarioStatus = 'unknown';
          let errorMessage = '';
          let duration = 0;

          if (scenario.steps && scenario.steps.length > 0) {
            const stepResults = scenario.steps.filter(step => step.result).map(step => step.result);

            if (stepResults.length > 0) {
              // Calculate overall duration
              duration = stepResults.reduce((total, result) => total + (result.duration || 0), 0);

              // Determine status based on step results
              if (stepResults.some(result => result.status === 'failed')) {
                scenarioStatus = 'failed';
                // Find the first failed step's error message
                const failedStep = scenario.steps.find(step => step.result && step.result.status === 'failed');
                errorMessage = failedStep ? failedStep.result.error_message : '';
              } else if (stepResults.every(result => result.status === 'skipped')) {
                scenarioStatus = 'skipped';
              } else if (stepResults.every(result => result.status === 'passed')) {
                scenarioStatus = 'passed';
              } else {
                scenarioStatus = 'unknown';
              }
            }
          }

          const scenarioResult = {
            status: scenarioStatus,
            error_message: errorMessage,
            duration: duration
          };

          resultsMap.set(key, scenarioResult);
        });
      }
    });

    const features = [];

    // Simple approach: scan each known directory
    const directories = ['auth', 'cv-management', 'job-tailoring', 'portfolio'];

    for (const dirName of directories) {
      const dirPath = path.join(featuresDir, dirName);
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });

        for (const item of items) {
          if (item.name.endsWith('.feature')) {
            const fullPath = path.join(dirPath, item.name);
            const relPath = `${dirName}/${item.name}`;
            const content = await fs.readFile(fullPath, 'utf8');
            const featureData = parseFeatureFile(content, relPath, fullPath);

            // Map results to scenarios
            if (featureData.scenarios) {
              featureData.scenarios.forEach(scenario => {
                const key = `src/features/${relPath}:${scenario.name}`;
                const result = resultsMap.get(key);
                if (result) {
                  scenario.result = result;
                }
              });
            }

            features.push(featureData);
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${dirName}:`, error.message);
      }
    }

    res.json({ features });
  } catch (error) {
    console.error('Error reading features with results:', error);
    res.status(500).json({ error: 'Failed to read features with results' });
  }
});

// Get all features and scenarios
app.get('/api/features', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const featuresDir = path.join(__dirname, '../src/features');
    const features = [];

    async function scanDirectory(dir, relativePath = '') {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relPath = path.join(relativePath, item.name);

        if (item.isDirectory()) {
          await scanDirectory(fullPath, relPath);
        } else if (item.name.endsWith('.feature')) {
          const content = await fs.readFile(fullPath, 'utf8');
          const featureData = parseFeatureFile(content, relPath, fullPath);
          features.push(featureData);
        }
      }
    }

    await scanDirectory(featuresDir);

    res.json({ features });
  } catch (error) {
    console.error('Error reading features:', error);
    res.status(500).json({ error: 'Failed to read features' });
  }
});

// Parse feature file content
function parseFeatureFile(content, relativePath, fullPath) {
  const lines = content.split('\n');
  const scenarios = [];
  let currentScenario = null;
  let featureName = '';
  let featureDescription = '';
  let inBackground = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    if (line.startsWith('Feature:')) {
      featureName = line.substring(8).trim();
      // Get feature description
      let descLines = [];
      for (let j = i + 1; j < lines.length && !lines[j].trim().startsWith('@') && !lines[j].trim().startsWith('Scenario:') && !lines[j].trim().startsWith('Background:'); j++) {
        if (lines[j].trim()) descLines.push(lines[j].trim());
      }
      featureDescription = descLines.join(' ');
    }

    if (line.startsWith('Background:')) {
      inBackground = true;
      continue;
    }

    if (line.startsWith('Scenario:') || line.startsWith('@')) {
      if (currentScenario && !inBackground) {
        scenarios.push(currentScenario);
      }

      let scenarioTags = [];
      let scenarioName = '';

      // Parse tags if present
      if (line.startsWith('@')) {
        const tagLine = line;
        scenarioTags = tagLine.split(' ').filter(tag => tag.startsWith('@'));
        // Find the scenario line
        while (i < lines.length && !lines[i].trim().startsWith('Scenario:')) {
          i++;
        }
        if (i < lines.length) {
          scenarioName = lines[i].trim().substring(9).trim();
        }
      } else {
        scenarioName = line.substring(9).trim();
      }

      if (scenarioName && !inBackground) {
        console.log(`📝 Creating scenario: ${scenarioName} with tags:`, scenarioTags);
        currentScenario = {
          name: scenarioName,
          tags: scenarioTags,
          line: lineNum,
          steps: []
        };
      }
      inBackground = false;
    }

    // Parse steps
    if (currentScenario && (line.startsWith('Given ') || line.startsWith('When ') || line.startsWith('Then ') || line.startsWith('And ') || line.startsWith('But '))) {
      currentScenario.steps.push({
        keyword: line.split(' ')[0],
        text: line.substring(line.indexOf(' ') + 1),
        line: lineNum
      });
    }
  }

  // Add the last scenario
  if (currentScenario && !inBackground) {
    scenarios.push(currentScenario);
  }

  return {
    name: featureName,
    description: featureDescription,
    file: relativePath,
    fullPath: fullPath,
    scenarios: scenarios
  };
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: {
      BASE_URL: process.env.BASE_URL,
      API_URL: process.env.API_URL,
      CI: process.env.CI,
      HEADLESS: process.env.HEADLESS
    }
  });
});

// Get environment info
app.get('/api/env', (req, res) => {
  res.json({
    BASE_URL: process.env.BASE_URL || 'http://localhost:5005',
    API_URL: process.env.API_URL || 'http://localhost:5001',
    CI: process.env.CI || 'false',
    HEADLESS: process.env.HEADLESS || 'false',
    SLOW_MO: process.env.SLOW_MO || '0',
    RECORD_VIDEO: process.env.RECORD_VIDEO || 'false',
    PREWARM_BROWSER: process.env.PREWARM_BROWSER || 'true'
  });
});

// Debug endpoint for testing
app.get('/api/debug', (req, res) => {
  try {
    const fs = require('fs').promises;
    const resultsPath = 'reports/results.json';

    // Check if file exists
    const fileExists = require('fs').existsSync(resultsPath);
    const fileSize = fileExists ? require('fs').statSync(resultsPath).size : 0;

    res.json({
      timestamp: new Date().toISOString(),
      fileExists: fileExists,
      fileSize: fileSize,
      cwd: process.cwd(),
      resultsPath: resultsPath,
      serverPort: process.env.PORT || 5006
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug feature parsing
app.get('/api/debug-parse', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');

  try {
    const featuresDir = path.join(__dirname, '../src/features');
    const items = await fs.readdir(featuresDir, { withFileTypes: true });

    let totalScenarios = 0;
    const featureStats = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const subDir = path.join(featuresDir, item.name);
        const subItems = await fs.readdir(subDir, { withFileTypes: true });

        for (const subItem of subItems) {
          if (subItem.name.endsWith('.feature')) {
            const featurePath = path.join(subDir, subItem.name);
            const content = await fs.readFile(featurePath, 'utf8');
            const featureData = parseFeatureFile(content, `${item.name}/${subItem.name}`, featurePath);

            featureStats.push({
              file: `${item.name}/${subItem.name}`,
              name: featureData.name,
              scenarios: featureData.scenarios.length
            });

            totalScenarios += featureData.scenarios.length;
          }
        }
      }
    }

    res.json({
      totalScenarios: totalScenarios,
      features: featureStats,
      debug: {
        featuresDir: featuresDir,
        itemsFound: items.length,
        directories: items.filter(i => i.isDirectory()).map(i => i.name)
      }
    });
  } catch (error) {
    console.error('Debug parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to simulate slow response
app.get('/api/test-loading', (req, res) => {
  setTimeout(() => {
    res.json({ message: 'Test response after delay', timestamp: new Date().toISOString() });
  }, 3000); // 3 second delay
});

const PORT = 5006;
app.listen(PORT, () => {
  console.log(`🚀 Cucumber Dashboard running at http://localhost:${PORT}`);
  console.log(`📊 View reports and re-run specific tests!`);
  console.log(`🔗 Open: http://localhost:${PORT}`);
});

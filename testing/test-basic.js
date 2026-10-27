#!/usr/bin/env node

/**
 * Basic test script để verify framework hoạt động
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Resumate Testing Framework...\n');

try {
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('❌ package.json not found. Are you in the testing directory?');
  }

  console.log('✅ package.json found');

  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    throw new Error('❌ node_modules not found. Run "npm install" first');
  }

  console.log('✅ Dependencies installed');

  // Check if src directory exists
  if (!fs.existsSync('src')) {
    throw new Error('❌ src directory not found');
  }

  console.log('✅ Source directory exists');

  // Check core files
  const coreFiles = [
    'src/core/BasePage.ts',
    'src/core/TestContext.ts',
    'src/core/BrowserManager.ts'
  ];

  for (const file of coreFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`❌ Core file missing: ${file}`);
    }
  }

  console.log('✅ Core files exist');

  // Check page objects
  const pageFiles = [
    'src/pages/auth/LoginPage.ts',
    'src/pages/auth/RegisterPage.ts'
  ];

  for (const file of pageFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`❌ Page object missing: ${file}`);
    }
  }

  console.log('✅ Page objects exist');

  // Check test data
  if (!fs.existsSync('src/fixtures/users/test-users.json')) {
    throw new Error('❌ Test data missing: test-users.json');
  }

  console.log('✅ Test data exists');

  // Check if playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    console.log('✅ Playwright installed');
  } catch (error) {
    throw new Error('❌ Playwright not installed. Run "npx playwright install"');
  }

  // Check TypeScript compilation
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
  } catch (error) {
    console.warn('⚠️  TypeScript compilation has warnings/errors');
  }

  // Check if smoke tests can run (dry run)
  try {
    execSync('npx playwright test --dry-run tests/smoke/', { stdio: 'pipe' });
    console.log('✅ Smoke tests syntax is valid');
  } catch (error) {
    console.warn('⚠️  Smoke tests may have syntax issues');
  }

  console.log('\n🎉 Testing Framework is READY!\n');

  console.log('📋 Next steps:');
  console.log('1. Copy env.example to .env and configure');
  console.log('2. Run: npm run test:smoke');
  console.log('3. Or run: ./scripts/run-tests.sh --type smoke --headed');
  console.log('4. View reports: npm run report\n');

  console.log('📚 Useful commands:');
  console.log('- npm run test:headed    # Run with visible browser');
  console.log('- npm run test:debug     # Debug mode');
  console.log('- npm run test:ui        # UI mode');
  console.log('- ./scripts/run-tests.sh --help  # See all options');

} catch (error) {
  console.error('\n❌ Setup verification failed:');
  console.error(error.message);
  console.log('\n🔧 To fix:');
  console.log('1. Make sure you\'re in the testing/ directory');
  console.log('2. Run: npm install');
  console.log('3. Run: npx playwright install');
  process.exit(1);
}

# Resumate Testing Framework

Comprehensive testing framework for Resumate application using **Behavior Driven Development (BDD)**, **Playwright**, and **Page Object Model**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd testing
npm install
npx playwright install
```

### Run Tests
```bash
# All tests
npm run test

# Smoke tests only
npm run test:smoke

# E2E tests only
npm run test:e2e

# Run with browser UI
npm run test:headed

# Debug mode
npm run test:debug

# CI mode
npm run test:ci
```

## 📁 Project Structure

```
testing/
├── src/
│   ├── core/              # Core utilities & base classes
│   │   ├── BasePage.ts    # Page Object base class
│   │   ├── TestContext.ts # Test execution context
│   │   ├── BrowserManager.ts # Browser management
│   │   ├── TestWorld.ts   # Cucumber world for BDD
│   │   └── types.ts       # TypeScript definitions
│   ├── pages/             # Page Object Models
│   │   ├── auth/
│   │   │   ├── LoginPage.ts
│   │   │   └── RegisterPage.ts
│   │   ├── dashboard/
│   │   ├── cv/
│   │   └── ...
│   ├── features/          # BDD feature files
│   ├── steps/             # Step definitions
│   ├── fixtures/          # Test data
│   ├── utils/             # Helper utilities
│   └── config/            # Configuration files
├── tests/                 # Test files
│   ├── smoke/            # Critical path tests
│   ├── e2e/              # End-to-end tests
│   ├── api/              # API tests
│   └── integration/      # Integration tests
├── reports/              # Test reports & artifacts
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## 🎯 Features

### ✅ Implemented
- **Page Object Model** - Reusable page components
- **Multi-browser testing** - Chrome, Firefox, Safari
- **BDD with Cucumber** - Gherkin syntax for test scenarios
- **Test data management** - Fixtures for consistent testing
- **Screenshot & video capture** - On test failures
- **Parallel execution** - Faster test runs
- **CI/CD ready** - GitHub Actions integration

### 🚧 In Progress
- **API testing integration**
- **Performance testing**
- **Visual regression testing**

## 🧪 Writing Tests

### BDD Feature Files
```gherkin
# src/features/auth/login.feature
Feature: User Authentication
  As a user
  I want to login to the application
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    And I click the login button
    Then I should be redirected to the dashboard
```

### Step Definitions
```typescript
// src/steps/auth.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { LoginPage } from '../pages/auth/LoginPage';

Given('I am on the login page', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.navigateToLogin();
});

When('I enter valid credentials', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.fillEmail('test@example.com');
  await loginPage.fillPassword('TestPassword123!');
});

When('I click the login button', async function () {
  const loginPage = new LoginPage(this.context.page);
  await loginPage.clickLoginButton();
});

Then('I should be redirected to the dashboard', async function () {
  await this.context.page.waitForURL('**/dashboard');
});
```

### Playwright Test Files
```typescript
// tests/smoke/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/auth/LoginPage';
import { TestDataManager } from '../../src/utils/test-data-manager';

test.describe('Login Functionality', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const testUser = TestDataManager.getRandomUser();

    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(testUser.email, testUser.password);

    // Assert
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

## 🏗️ Architecture

### Page Object Model
```typescript
// Base page with common functionality
export class BasePage {
  protected page: Page;

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(`${this.baseURL}${path}`);
  }

  async clickElement(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }
}

// Specific page extending base
export class LoginPage extends BasePage {
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }
}
```

### Test Context Management
```typescript
// Shared context across tests
export class TestContext {
  public page: Page;
  public browser: Browser;
  public context: BrowserContext;
  public currentPage: BasePage | null = null;

  // Test data
  public testUser: any = null;
  public testCV: any = null;
  public testProject: any = null;
}
```

## ⚙️ Configuration

### Environment Variables
```bash
# .env
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000
CI=false
HEADLESS=false
SLOW_MO=0
RECORD_VIDEO=false
PREWARM_BROWSER=true
```

### Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html'], ['json']]
    : [['html'], ['list']],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  use: {
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

## 📊 Test Execution

### Local Development
```bash
# Run all tests
npm run test

# Run specific test file
npx playwright test tests/smoke/login.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with UI mode
npm run test:ui
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:ci
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 📈 Reporting

### HTML Reports
```bash
npm run report
# Opens HTML report in browser
```

### Allure Reports
```bash
npm run test:ci
npx allure generate reports/allure-results --clean
npx allure open
```

## 🔧 Maintenance

### Adding New Page Objects
1. Create new page class extending `BasePage`
2. Define selectors and methods
3. Add to appropriate folder structure
4. Update imports in test files

### Adding Test Data
1. Add JSON files to `src/fixtures/`
2. Update `TestDataManager` if needed
3. Use in tests via `TestDataManager.getRandomUser()`

### Adding New Browsers
1. Update `playwright.config.ts` projects array
2. Install browser: `npx playwright install webkit`

## 🚨 Troubleshooting

### Common Issues

**Tests failing intermittently**
- Increase timeouts in `playwright.config.ts`
- Add retry logic for flaky operations
- Use `waitFor` methods instead of fixed delays

**Element not found**
- Check selectors are correct
- Use data-testid attributes
- Wait for elements to be visible before interacting

**Slow test execution**
- Run tests in parallel with `fullyParallel: true`
- Use `workers` to control parallel processes
- Optimize page load waits

## 📚 Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Page Object Model Guide](docs/page-objects.md)
- [Writing BDD Features](docs/bdd-guide.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

---

## 🎯 Quick Commands

```bash
# Setup
npm install && npx playwright install

# Development
npm run test:headed    # Run with browser
npm run test:debug    # Debug mode
npm run test:ui       # UI mode

# CI/CD
npm run test:ci       # CI mode
npm run report        # View reports

# Maintenance
npm run lint          # Code linting
npm run type-check    # TypeScript check
```

Happy Testing! 🚀

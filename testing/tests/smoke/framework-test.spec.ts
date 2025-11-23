import { test, expect } from '@playwright/test';
import { BrowserManager } from '../../src/core/BrowserManager';
import { TestDataManager } from '../../src/utils/test-data-manager';

/**
 * Framework functionality tests - no server required
 */
test.describe('Testing Framework - Core Functionality', () => {

  test.beforeAll(async () => {
    // Load test data
    await TestDataManager.loadAllTestData();
  });

  test('should load test data successfully', async () => {
    // Verify test data is loaded
    const users = TestDataManager.getAllUsers();
    const cvs = TestDataManager.getAllCVs();
    const jds = TestDataManager.getAllJobDescriptions();

    expect(users.length).toBeGreaterThan(0);
    expect(cvs.length).toBeGreaterThan(0);
    expect(jds.length).toBeGreaterThan(0);

    console.log(`✅ Loaded ${users.length} users, ${cvs.length} CVs, ${jds.length} job descriptions`);
  });

  test('should get random test user', async () => {
    const user = TestDataManager.getRandomUser();

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.password).toBeDefined();

    console.log(`✅ Random user: ${user.name} (${user.email})`);
  });

  test('should get test user by plan', async () => {
    const freeUser = TestDataManager.getUserByPlan('free');
    const proUser = TestDataManager.getUserByPlan('pro');

    expect(freeUser).toBeDefined();
    expect(proUser).toBeDefined();

    expect(freeUser?.plan).toBe('free');
    expect(proUser?.plan).toBe('pro');

    console.log(`✅ Free user: ${freeUser?.name}, Pro user: ${proUser?.name}`);
  });

  test('should get random CV sample', async () => {
    const cv = TestDataManager.getRandomCV();

    expect(cv).toBeDefined();
    expect(cv.id).toBeDefined();
    expect(cv.filename).toBeDefined();
    expect(cv.contact).toBeDefined();
    expect(cv.experience).toBeDefined();
    expect(cv.skills).toBeDefined();

    console.log(`✅ Random CV: ${cv.filename} - ${cv.contact.name}`);
  });

  test('should get random job description', async () => {
    const jd = TestDataManager.getRandomJobDescription();

    expect(jd).toBeDefined();
    expect(jd.id).toBeDefined();
    expect(jd.title).toBeDefined();
    expect(jd.company).toBeDefined();
    expect(jd.description).toBeDefined();
    expect(jd.requirements).toBeDefined();

    console.log(`✅ Random JD: ${jd.title} at ${jd.company}`);
  });

  test('should create dynamic test project', async () => {
    const project = TestDataManager.createTestProject({
      name: 'Dynamic Test Project',
      role: 'QA Engineer',
      techStack: ['Playwright', 'TypeScript', 'Testing']
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Dynamic Test Project');
    expect(project.role).toBe('QA Engineer');
    expect(project.techStack).toContain('Playwright');
    expect(project.techStack).toContain('TypeScript');
    expect(project.techStack).toContain('Testing');

    console.log(`✅ Created dynamic project: ${project.name}`);
  });

  test('should validate data integrity', async () => {
    const isValid = TestDataManager.validateDataIntegrity();
    expect(isValid).toBe(true);

    console.log('✅ Test data integrity validated');
  });

  test('should create browser manager instance', async () => {
    // Test browser manager creation (without actually launching browser)
    expect(BrowserManager).toBeDefined();
    expect(typeof BrowserManager.getBrowser).toBe('function');
    expect(typeof BrowserManager.createTestContext).toBe('function');

    console.log('✅ Browser manager available');
  });

  test('should get browser capabilities', async () => {
    const chromiumCapabilities = BrowserManager.getBrowserCapabilities('chromium');
    const firefoxCapabilities = BrowserManager.getBrowserCapabilities('firefox');
    const webkitCapabilities = BrowserManager.getBrowserCapabilities('webkit');

    expect(chromiumCapabilities.length).toBeGreaterThan(0);
    expect(firefoxCapabilities.length).toBeGreaterThan(0);
    expect(webkitCapabilities.length).toBeGreaterThan(0);

    console.log('✅ Browser capabilities retrieved');
  });

  test('framework smoke test - all core components working', async () => {
    // This test verifies that all core framework components are working together

    // 1. Test data loading
    const user = TestDataManager.getRandomUser();
    const cv = TestDataManager.getRandomCV();
    const jd = TestDataManager.getRandomJobDescription();

    expect(user).toBeDefined();
    expect(cv).toBeDefined();
    expect(jd).toBeDefined();

    // 2. Test project creation
    const project = TestDataManager.createTestProject();

    // 3. Verify all required properties
    expect(project.id).toBeDefined();
    expect(project.name).toBeDefined();
    expect(project.role).toBeDefined();
    expect(project.techStack).toBeDefined();
    expect(Array.isArray(project.techStack)).toBe(true);
    expect(project.techStack.length).toBeGreaterThan(0);

    console.log('🎉 Framework smoke test PASSED!');
    console.log(`   User: ${user.name}`);
    console.log(`   CV: ${cv.filename}`);
    console.log(`   JD: ${jd.title}`);
    console.log(`   Project: ${project.name} (${project.techStack.join(', ')})`);
  });
});

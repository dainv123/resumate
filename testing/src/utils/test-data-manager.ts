import fs from 'fs-extra';
import path from 'path';
import { TestUser, TestCV, TestProject, TestJobDescription } from '../core/types';

/**
 * Test Data Manager - handles loading and managing test data
 */
export class TestDataManager {
  private static users: TestUser[] = [];
  private static cvs: TestCV[] = [];
  private static projects: TestProject[] = [];
  private static jobDescriptions: TestJobDescription[] = [];

  /**
   * Load all test data from fixtures
   */
  static async loadAllTestData(): Promise<void> {
    try {
      console.log('📂 Loading test data...');

      // Load users
      const usersPath = path.join(__dirname, '../fixtures/users/test-users.json');
      if (await fs.pathExists(usersPath)) {
        this.users = await fs.readJson(usersPath);
        console.log(`✅ Loaded ${this.users.length} test users`);
      }

      // Load CVs
      const cvFiles = await fs.readdir(path.join(__dirname, '../fixtures/cv-samples'));
      for (const file of cvFiles) {
        if (file.endsWith('.json')) {
          const cvPath = path.join(__dirname, '../fixtures/cv-samples', file);
          const cv = await fs.readJson(cvPath);
          this.cvs.push(cv);
        }
      }
      console.log(`✅ Loaded ${this.cvs.length} sample CVs`);

      // Load job descriptions
      const jdFiles = await fs.readdir(path.join(__dirname, '../fixtures/job-descriptions'));
      for (const file of jdFiles) {
        if (file.endsWith('.json')) {
          const jdPath = path.join(__dirname, '../fixtures/job-descriptions', file);
          const jd = await fs.readJson(jdPath);
          this.jobDescriptions.push(jd);
        }
      }
      console.log(`✅ Loaded ${this.jobDescriptions.length} job descriptions`);

      console.log('📂 All test data loaded successfully!');

    } catch (error) {
      console.error('❌ Error loading test data:', error);
      throw error;
    }
  }

  /**
   * Get random test user
   */
  static getRandomUser(): TestUser {
    if (this.users.length === 0) {
      throw new Error('No test users loaded. Call loadAllTestData() first.');
    }
    const randomIndex = Math.floor(Math.random() * this.users.length);
    return this.users[randomIndex];
  }

  /**
   * Get user by email
   */
  static getUserByEmail(email: string): TestUser | undefined {
    return this.users.find(user => user.email === email);
  }

  /**
   * Get user by plan type
   */
  static getUserByPlan(plan: 'free' | 'pro'): TestUser | undefined {
    return this.users.find(user => user.plan === plan);
  }

  /**
   * Get all test users
   */
  static getAllUsers(): TestUser[] {
    return [...this.users];
  }

  /**
   * Get random CV sample
   */
  static getRandomCV(): TestCV {
    if (this.cvs.length === 0) {
      throw new Error('No CV samples loaded. Call loadAllTestData() first.');
    }
    const randomIndex = Math.floor(Math.random() * this.cvs.length);
    return this.cvs[randomIndex];
  }

  /**
   * Get CV by filename
   */
  static getCVByFilename(filename: string): TestCV | undefined {
    return this.cvs.find(cv => cv.filename === filename);
  }

  /**
   * Get all CV samples
   */
  static getAllCVs(): TestCV[] {
    return [...this.cvs];
  }

  /**
   * Get random job description
   */
  static getRandomJobDescription(): TestJobDescription {
    if (this.jobDescriptions.length === 0) {
      throw new Error('No job descriptions loaded. Call loadAllTestData() first.');
    }
    const randomIndex = Math.floor(Math.random() * this.jobDescriptions.length);
    return this.jobDescriptions[randomIndex];
  }

  /**
   * Get job description by title
   */
  static getJobDescriptionByTitle(title: string): TestJobDescription | undefined {
    return this.jobDescriptions.find(jd => jd.title === title);
  }

  /**
   * Get all job descriptions
   */
  static getAllJobDescriptions(): TestJobDescription[] {
    return [...this.jobDescriptions];
  }

  /**
   * Create test project data
   */
  static createTestProject(overrides: Partial<TestProject> = {}): TestProject {
    return {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Testing Framework Development',
      role: 'Test Automation Engineer',
      techStack: ['BDD', 'Playwright', 'Page Object Model', 'TypeScript'],
      description: 'Development of comprehensive testing framework using modern automation tools and best practices.',
      results: 'Reduced testing time by 70%, improved test coverage to 95%, enhanced CI/CD pipeline reliability.',
      demoLink: 'https://github.com/test-framework/demo',
      githubLink: 'https://github.com/test-framework/repo',
      imageUrl: 'https://example.com/test-framework.png',
      ...overrides
    };
  }

  /**
   * Generate dynamic test data
   */
  static generateDynamicUser(overrides: Partial<TestUser> = {}): TestUser {
    const timestamp = Date.now();
    return {
      id: `user-${timestamp}`,
      email: `test-${timestamp}@example.com`,
      password: 'TestPassword123!',
      name: `Test User ${timestamp}`,
      plan: 'free',
      ...overrides
    };
  }

  /**
   * Clean up test data (useful for teardown)
   */
  static async cleanup(): Promise<void> {
    try {
      // Clear in-memory data
      this.users = [];
      this.cvs = [];
      this.projects = [];
      this.jobDescriptions = [];

      console.log('🧹 Test data cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up test data:', error);
    }
  }

  /**
   * Validate test data integrity
   */
  static validateDataIntegrity(): boolean {
    try {
      // Check if all required fields exist
      const userValidation = this.users.every(user =>
        user.id && user.email && user.password && user.name
      );

      const cvValidation = this.cvs.every(cv =>
        cv.id && cv.filename && cv.userId
      );

      const jdValidation = this.jobDescriptions.every(jd =>
        jd.id && jd.title && jd.company && jd.description
      );

      return userValidation && cvValidation && jdValidation;
    } catch (error) {
      console.error('❌ Data integrity validation failed:', error);
      return false;
    }
  }
}

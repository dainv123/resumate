// Test Data Types
export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  plan?: 'free' | 'pro';
  avatar?: string;
}

export interface TestCV {
  id: string;
  filename: string;
  filePath: string;
  userId: string;
  parsed?: boolean;
}

export interface TestProject {
  id: string;
  name: string;
  role: string;
  techStack: string[];
  description: string;
  results?: string;
  demoLink?: string;
  githubLink?: string;
  imageUrl?: string;
}

export interface TestJobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  content: string;
}

export interface TestPortfolio {
  id: string;
  template: string;
  sections: string[];
  customizations: any;
}

// Test Configuration Types
export interface TestEnvironment {
  name: string;
  baseURL: string;
  apiURL: string;
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
}

export interface BrowserConfig {
  type: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  viewport: { width: number; height: number };
  slowMo?: number;
  args?: string[];
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: TestUser;
  expiresIn: number;
}

export interface CVUploadResponse {
  cv: TestCV;
  message: string;
}

// Test Execution Types
export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
  video?: string;
}

export interface TestSuiteResult {
  suiteName: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
}

// Cucumber World Parameters
export interface WorldParameters {
  baseURL: string;
  apiURL: string;
  testUser?: TestUser;
  authToken?: string;
}

// Page Object Types
export interface PageElement {
  selector: string;
  description: string;
  type: 'button' | 'input' | 'text' | 'link' | 'select' | 'checkbox' | 'radio';
}

export interface PageElements {
  [key: string]: PageElement;
}

// Test Data Generators
export interface DataGenerator<T> {
  generate(): T;
  generateMany(count: number): T[];
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Browser Types
export type BrowserType = 'chromium' | 'firefox' | 'webkit';
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

// Test Priority Levels
export type TestPriority = 'critical' | 'high' | 'medium' | 'low';

// Test Categories
export type TestCategory = 'smoke' | 'regression' | 'integration' | 'e2e' | 'api' | 'performance';

// Environment Types
export type EnvironmentType = 'local' | 'development' | 'staging' | 'production' | 'ci';

// Report Types
export type ReportFormat = 'html' | 'json' | 'xml' | 'junit' | 'allure';

// Assertion Types
export interface AssertionResult {
  passed: boolean;
  message: string;
  expected?: any;
  actual?: any;
  stack?: string;
}

// Hook Types for Cucumber
export type BeforeHook = () => Promise<void> | void;
export type AfterHook = () => Promise<void> | void;
export type BeforeStepHook = () => Promise<void> | void;
export type AfterStepHook = () => Promise<void> | void;

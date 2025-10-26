// Test setup file
import 'reflect-metadata';

// Mock console methods for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  createMockCVData: () => ({
    contact: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
    },
    summary: 'Test summary',
    experience: [],
    education: [],
    skills: {
      technical: [],
      tools: [],
      languages: [],
      soft: [],
    },
    projects: [],
  }),

  createMockLegacyCVData: () => ({
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    summary: 'Test summary',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: [],
    },
    projects: [],
  }),
};

// Extend Jest matchers
expect.extend({
  toBeValidCVData(received) {
    const pass =
      received &&
      received.contact &&
      received.contact.name &&
      received.contact.email &&
      received.summary !== undefined &&
      Array.isArray(received.experience) &&
      Array.isArray(received.education) &&
      received.skills &&
      Array.isArray(received.projects);

    if (pass) {
      return {
        message: () => `expected ${received} not to be valid CV data`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid CV data`,
        pass: false,
      };
    }
  },

  toHaveValidContact(received) {
    const pass =
      received &&
      received.contact &&
      typeof received.contact.name === 'string' &&
      typeof received.contact.email === 'string';

    if (pass) {
      return {
        message: () =>
          `expected ${received} not to have valid contact information`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have valid contact information`,
        pass: false,
      };
    }
  },
});

// Type declarations for global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCVData(): R;
      toHaveValidContact(): R;
    }
  }

  var testUtils: {
    createMockCVData: () => any;
    createMockLegacyCVData: () => any;
  };
}

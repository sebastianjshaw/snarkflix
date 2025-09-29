// Jest configuration for Snarkflix tests
module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'script.js',
    'reviews-data.js',
    'generate-review-pages.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset mocks between tests
  resetMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Module name mapping for ES6 imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:8000'
  },
  
  // Global setup (optional)
  // globalSetup: '<rootDir>/tests/global-setup.js',
  
  // Global teardown (optional)
  // globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Test results processor (optional)
  // testResultsProcessor: '<rootDir>/tests/test-results-processor.js',
  
  // Watch plugins (optional)
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],
  
  // Notify configuration (disabled for CI)
  notify: false,
  // notifyMode: 'failure-change',
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Force exit
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: false,
  
  // Detect leaks
  detectLeaks: false
};

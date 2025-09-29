// Global setup for Snarkflix tests
module.exports = async () => {
  // Set up global test environment
  console.log('Setting up Snarkflix test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_URL = 'http://localhost:8000';
  
  // Mock performance API if not available
  if (!global.performance) {
    global.performance = {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      }
    };
  }
  
  // Mock IntersectionObserver if not available
  if (!global.IntersectionObserver) {
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // Mock ResizeObserver if not available
  if (!global.ResizeObserver) {
    global.ResizeObserver = class ResizeObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  
  // Mock URL.createObjectURL and URL.revokeObjectURL
  if (!global.URL.createObjectURL) {
    global.URL.createObjectURL = jest.fn(() => 'mocked-url');
  }
  if (!global.URL.revokeObjectURL) {
    global.URL.revokeObjectURL = jest.fn();
  }
  
  // Mock clipboard API
  if (!navigator.clipboard) {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
        readText: jest.fn(() => Promise.resolve(''))
      }
    });
  }
  
  // Mock window.open
  if (!global.open) {
    global.open = jest.fn();
  }
  
  // Mock window.scrollTo
  if (!global.scrollTo) {
    global.scrollTo = jest.fn();
  }
  
  // Mock MutationObserver
  if (!global.MutationObserver) {
    global.MutationObserver = class MutationObserver {
      constructor() {}
      observe() {}
      disconnect() {}
    };
  }
  
  // Mock fetch
  if (!global.fetch) {
    global.fetch = jest.fn();
  }
  
  console.log('Snarkflix test environment setup complete.');
};

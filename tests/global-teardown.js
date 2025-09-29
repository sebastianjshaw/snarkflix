// Global teardown for Snarkflix tests
module.exports = async () => {
  console.log('Cleaning up Snarkflix test environment...');
  
  // Clean up global mocks
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
  
  if (global.open && global.open.mockClear) {
    global.open.mockClear();
  }
  
  if (global.scrollTo && global.scrollTo.mockClear) {
    global.scrollTo.mockClear();
  }
  
  // Clean up console mocks
  if (console.log && console.log.mockClear) {
    console.log.mockClear();
  }
  
  if (console.error && console.error.mockClear) {
    console.error.mockClear();
  }
  
  if (console.warn && console.warn.mockClear) {
    console.warn.mockClear();
  }
  
  // Clean up clipboard mocks
  if (navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.writeText.mockClear) {
    navigator.clipboard.writeText.mockClear();
  }
  
  if (navigator.clipboard && navigator.clipboard.readText && navigator.clipboard.readText.mockClear) {
    navigator.clipboard.readText.mockClear();
  }
  
  // Clean up URL mocks
  if (global.URL.createObjectURL && global.URL.createObjectURL.mockClear) {
    global.URL.createObjectURL.mockClear();
  }
  
  if (global.URL.revokeObjectURL && global.URL.revokeObjectURL.mockClear) {
    global.URL.revokeObjectURL.mockClear();
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  console.log('Snarkflix test environment cleanup complete.');
};

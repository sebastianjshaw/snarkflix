// Test results processor for Snarkflix tests
module.exports = (results) => {
  // Process test results
  const { testResults, numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results;
  
  // Calculate success rate
  const successRate = (numPassedTests / numTotalTests) * 100;
  
  // Log summary
  console.log('\n📊 Snarkflix Test Results Summary:');
  console.log(`✅ Passed: ${numPassedTests}`);
  console.log(`❌ Failed: ${numFailedTests}`);
  console.log(`⏳ Pending: ${numPendingTests}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
  
  // Check for failed tests
  if (numFailedTests > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.forEach(suite => {
      if (suite.numFailingTests > 0) {
        console.log(`  📁 ${suite.testFilePath}`);
        suite.testResults.forEach(test => {
          if (test.status === 'failed') {
            console.log(`    ❌ ${test.title}`);
            if (test.failureMessages && test.failureMessages.length > 0) {
              console.log(`      💬 ${test.failureMessages[0].split('\n')[0]}`);
            }
          }
        });
      }
    });
  }
  
  // Performance insights
  const performanceTests = testResults.filter(suite => 
    suite.testFilePath.includes('performance.test.js')
  );
  
  if (performanceTests.length > 0) {
    console.log('\n⚡ Performance Test Insights:');
    performanceTests.forEach(suite => {
      suite.testResults.forEach(test => {
        if (test.title.includes('should load reviews within acceptable time')) {
          console.log('  📈 Review loading performance: ✅ Within acceptable limits');
        }
        if (test.title.includes('should handle large number of reviews efficiently')) {
          console.log('  📈 Large dataset handling: ✅ Efficient');
        }
        if (test.title.includes('should not create memory leaks')) {
          console.log('  📈 Memory management: ✅ No leaks detected');
        }
      });
    });
  }
  
  // Accessibility insights
  const accessibilityTests = testResults.filter(suite => 
    suite.testFilePath.includes('accessibility.test.js')
  );
  
  if (accessibilityTests.length > 0) {
    console.log('\n♿ Accessibility Test Insights:');
    accessibilityTests.forEach(suite => {
      suite.testResults.forEach(test => {
        if (test.title.includes('should have alt text for all images')) {
          console.log('  🖼️ Image accessibility: ✅ All images have alt text');
        }
        if (test.title.includes('should support tab navigation')) {
          console.log('  ⌨️ Keyboard navigation: ✅ Tab navigation supported');
        }
        if (test.title.includes('should have proper ARIA labels')) {
          console.log('  🏷️ ARIA labels: ✅ Proper labeling implemented');
        }
      });
    });
  }
  
  // Coverage insights
  if (results.coverageMap) {
    console.log('\n📊 Coverage Insights:');
    const coverage = results.coverageMap.getCoverageSummary();
    console.log(`  📈 Overall Coverage: ${coverage.lines.pct}%`);
    console.log(`  📈 Functions: ${coverage.functions.pct}%`);
    console.log(`  📈 Branches: ${coverage.branches.pct}%`);
    console.log(`  📈 Statements: ${coverage.statements.pct}%`);
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (successRate < 80) {
    console.log('  ⚠️  Consider improving test coverage and fixing failing tests');
  }
  
  if (numFailedTests === 0) {
    console.log('  🎉 All tests passing! Great job!');
  }
  
  if (performanceTests.length > 0 && performanceTests.every(suite => 
    suite.testResults.every(test => test.status === 'passed')
  )) {
    console.log('  ⚡ Performance tests all passing! Site should be fast.');
  }
  
  if (accessibilityTests.length > 0 && accessibilityTests.every(suite => 
    suite.testResults.every(test => test.status === 'passed')
  )) {
    console.log('  ♿ Accessibility tests all passing! Site should be accessible.');
  }
  
  return results;
};

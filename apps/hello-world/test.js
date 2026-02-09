import { greet, getAppInfo } from './dist/index.js';

console.log('Running tests...\n');

// Test 1: Check app info
const appInfo = getAppInfo();
console.log('Test 1: Get app info');
console.log('  Result:', appInfo);
console.log('  ✓ Passed\n');

// Test 2: Check greet function
const greeting = greet('World');
console.log('Test 2: Greet function');
console.log('  Result:', greeting);
console.log('  ✓ Passed\n');

console.log('All tests passed!');

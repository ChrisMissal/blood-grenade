import { greet, getAppInfo, VERSION, ENVIRONMENT, BUILD_TIME } from './dist/index.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\n    Expected: ${expected}\n    Got: ${actual}`);
  }
}

function assertType(value, type, message) {
  if (typeof value !== type) {
    throw new Error(`${message}\n    Expected type: ${type}\n    Got type: ${typeof value}`);
  }
}

console.log('Testing hello-world app structure...\n');

// === EXPORTS TEST ===
console.log('Exports:');
test('greet function is exported', () => {
  assertType(greet, 'function', 'greet should be a function');
});

test('getAppInfo function is exported', () => {
  assertType(getAppInfo, 'function', 'getAppInfo should be a function');
});

test('VERSION constant is exported', () => {
  assertType(VERSION, 'string', 'VERSION should be a string');
});

test('ENVIRONMENT constant is exported', () => {
  assertType(ENVIRONMENT, 'string', 'ENVIRONMENT should be a string');
});

test('BUILD_TIME constant is exported', () => {
  assertType(BUILD_TIME, 'string', 'BUILD_TIME should be a string');
});

// === METADATA TEST ===
console.log('\nMetadata:');
test('VERSION is replaced during build', () => {
  assert(VERSION !== '__VERSION__', 'VERSION should be replaced from __VERSION__ placeholder');
});

test('ENVIRONMENT is replaced during build', () => {
  assert(ENVIRONMENT !== '__ENVIRONMENT__', 'ENVIRONMENT should be replaced from __ENVIRONMENT__ placeholder');
});

test('BUILD_TIME is replaced during build', () => {
  assert(BUILD_TIME !== '__BUILD_TIME__', 'BUILD_TIME should be replaced from __BUILD_TIME__ placeholder');
});

// === GETAPPINFO TEST ===
console.log('\ngetAppInfo():');
test('returns an object', () => {
  const appInfo = getAppInfo();
  assert(appInfo !== null && typeof appInfo === 'object' && !Array.isArray(appInfo), 
    'getAppInfo should return an object');
});

test('has version property', () => {
  const appInfo = getAppInfo();
  assert('version' in appInfo, 'getAppInfo should return object with version property');
});

test('has environment property', () => {
  const appInfo = getAppInfo();
  assert('environment' in appInfo, 'getAppInfo should return object with environment property');
});

test('has buildTime property', () => {
  const appInfo = getAppInfo();
  assert('buildTime' in appInfo, 'getAppInfo should return object with buildTime property');
});

test('version property matches VERSION constant', () => {
  const appInfo = getAppInfo();
  assertEqual(appInfo.version, VERSION, 'version property should match VERSION constant');
});

test('environment property matches ENVIRONMENT constant', () => {
  const appInfo = getAppInfo();
  assertEqual(appInfo.environment, ENVIRONMENT, 'environment property should match ENVIRONMENT constant');
});

test('buildTime property matches BUILD_TIME constant', () => {
  const appInfo = getAppInfo();
  assertEqual(appInfo.buildTime, BUILD_TIME, 'buildTime property should match BUILD_TIME constant');
});

// === GREET TEST ===
console.log('\ngreet():');
test('returns a string', () => {
  const greeting = greet('World');
  assertType(greeting, 'string', 'greet should return a string');
});

test('includes the provided name', () => {
  const greeting = greet('Alice');
  assert(greeting.includes('Alice'), 'greet should include the provided name');
});

test('includes "Hello" greeting', () => {
  const greeting = greet('World');
  assert(greeting.includes('Hello'), 'greet should include "Hello" in the greeting');
});

test('includes version information', () => {
  const greeting = greet('World');
  assert(greeting.includes(VERSION), 'greet should include version information');
});

test('includes environment information', () => {
  const greeting = greet('World');
  assert(greeting.includes(ENVIRONMENT), 'greet should include environment information');
});

// === FILE STRUCTURE TEST ===
console.log('\nFile structure:');
test('package.json exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'package.json'));
  assert(exists, 'package.json should exist');
});

test('tsconfig.json exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'tsconfig.json'));
  assert(exists, 'tsconfig.json should exist');
});

test('src/index.js exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'src', 'index.js'));
  assert(exists, 'src/index.js should exist');
});

test('dist/index.js exists (built)', () => {
  const exists = fs.existsSync(path.join(__dirname, 'dist', 'index.js'));
  assert(exists, 'dist/index.js should exist (must build first)');
});

test('build.js script exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'build.js'));
  assert(exists, 'build.js should exist');
});

test('test.js script exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'test.js'));
  assert(exists, 'test.js should exist');
});

// === PACKAGE.JSON STRUCTURE TEST ===
console.log('\nPackage.json structure:');
test('package.json has valid JSON', () => {
  const content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  JSON.parse(content);
});

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

test('name includes hello-world', () => {
  assert(packageJson.name.includes('hello-world'), 'package name should include hello-world');
});

test('has build script', () => {
  assert('build' in packageJson.scripts, 'package.json should have build script');
});

test('has test script', () => {
  assert('test' in packageJson.scripts, 'package.json should have test script');
});

test('has typecheck script', () => {
  assert('typecheck' in packageJson.scripts, 'package.json should have typecheck script');
});

test('has commitlint script', () => {
  assert('commitlint' in packageJson.scripts, 'package.json should have commitlint script');
});

test('has depcheck script', () => {
  assert('depcheck' in packageJson.scripts, 'package.json should have depcheck script');
});

test('packageManager is npm', () => {
  assert(packageJson.packageManager && packageJson.packageManager.startsWith('npm'), 
    'packageManager should be locked to npm');
});

// === GOLDEN FILE TESTS ===
console.log('\nGolden file validation:');

function normalizeOutput(output, replacements) {
  let normalized = output;
  for (const [key, value] of Object.entries(replacements)) {
    normalized = normalized.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return normalized;
}

function assertMatchesGolden(actual, goldenPath, replacements, description) {
  const goldenContent = fs.readFileSync(goldenPath, 'utf8');
  const expected = normalizeOutput(goldenContent, replacements).trim();
  const actualNormalized = actual.trim();
  
  // Normalize line endings for comparison
  const expectedNorm = expected.replace(/\r\n/g, '\n');
  const actualNorm = actualNormalized.replace(/\r\n/g, '\n');
  
  if (actualNorm !== expectedNorm) {
    throw new Error(`${description}\n    Expected:\n${expectedNorm}\n    Got:\n${actualNorm}`);
  }
}

test('greet output matches golden file format', () => {
  const greeting = greet('World');
  const appInfo = getAppInfo();
  const output = `${greeting}\n\nApp Info:\n  Version: ${appInfo.version}\n  Environment: ${appInfo.environment}\n  Build Time: ${appInfo.buildTime}`;
  
  const goldenPath = path.join(__dirname, 'test', 'golden', 'console-output.txt');
  assertMatchesGolden(output, goldenPath, {
    VERSION: VERSION,
    ENVIRONMENT: ENVIRONMENT,
    BUILD_TIME: BUILD_TIME
  }, 'Console output should match golden file');
});

// === SUMMARY ===
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`${'='.repeat(50)}`);

if (testsFailed > 0) {
  process.exit(1);
}

console.log('\n✓ All tests passed!');

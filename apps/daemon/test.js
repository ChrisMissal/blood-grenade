import { getAppInfo, createHealthResponse, VERSION, ENVIRONMENT } from './dist/index.js';
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

test('name includes daemon', () => {
  assert(packageJson.name.includes('daemon'), 'package name should include daemon');
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

test('health response matches expected format', () => {
  const health = createHealthResponse();
  assert(health.service === 'daemon', 'Health service should be daemon');
  assert(typeof health.status === 'string', 'Status should be string');
  assert(typeof health.timestamp === 'string', 'Timestamp should be string');
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

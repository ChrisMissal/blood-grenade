import { getAppInfo, createHealthResponse, createServer, createJob, getJob, getAllJobs, VERSION, ENVIRONMENT } from './dist/index.js';
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

console.log('Testing web-jobs app structure...\n');

// === EXPORTS TEST ===
console.log('Exports:');
test('getAppInfo function is exported', () => {
  assertType(getAppInfo, 'function', 'getAppInfo should be a function');
});

test('createHealthResponse function is exported', () => {
  assertType(createHealthResponse, 'function', 'createHealthResponse should be a function');
});

test('createServer function is exported', () => {
  assertType(createServer, 'function', 'createServer should be a function');
});

test('createJob function is exported', () => {
  assertType(createJob, 'function', 'createJob should be a function');
});

test('getJob function is exported', () => {
  assertType(getJob, 'function', 'getJob should be a function');
});

test('getAllJobs function is exported', () => {
  assertType(getAllJobs, 'function', 'getAllJobs should be a function');
});

test('VERSION constant is exported', () => {
  assertType(VERSION, 'string', 'VERSION should be a string');
});

test('ENVIRONMENT constant is exported', () => {
  assertType(ENVIRONMENT, 'string', 'ENVIRONMENT should be a string');
});

// === METADATA TEST ===
console.log('\nMetadata:');
test('VERSION is replaced during build', () => {
  assert(VERSION !== '__VERSION__', 'VERSION should be replaced from __VERSION__ placeholder');
});

test('ENVIRONMENT is replaced during build', () => {
  assert(ENVIRONMENT !== '__ENVIRONMENT__', 'ENVIRONMENT should be replaced from __ENVIRONMENT__ placeholder');
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

test('version property matches VERSION constant', () => {
  const appInfo = getAppInfo();
  assertEqual(appInfo.version, VERSION, 'version property should match VERSION constant');
});

test('environment property matches ENVIRONMENT constant', () => {
  const appInfo = getAppInfo();
  assertEqual(appInfo.environment, ENVIRONMENT, 'environment property should match ENVIRONMENT constant');
});

// === JOB FUNCTIONS TEST ===
console.log('\nJob Functions:');
test('createJob returns an object with required properties', () => {
  const job = createJob('test', { foo: 'bar' });
  assert(job !== null && typeof job === 'object', 'createJob should return an object');
  assert('id' in job, 'job should have id');
  assert('type' in job, 'job should have type');
  assert('data' in job, 'job should have data');
  assert('status' in job, 'job should have status');
});

test('getAllJobs returns pending and completed arrays', () => {
  const jobs = getAllJobs();
  assert('pending' in jobs && Array.isArray(jobs.pending), 'should have pending array');
  assert('completed' in jobs && Array.isArray(jobs.completed), 'should have completed array');
});

test('createHealthResponse includes status property', () => {
  const health = createHealthResponse();
  assert('status' in health, 'health response should include status');
});

test('createHealthResponse includes version information', () => {
  const health = createHealthResponse();
  assert('version' in health && health.version === VERSION, 
    'health response should include version');
});

test('createHealthResponse includes timestamp', () => {
  const health = createHealthResponse();
  assert('timestamp' in health, 'health response should include timestamp');
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

test('name includes web-jobs', () => {
  assert(packageJson.name.includes('web-jobs'), 'package name should include web-jobs');
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
  const actualNormalized = JSON.stringify(JSON.parse(actual), null, 2);
  const expectedNormalized = JSON.stringify(JSON.parse(expected), null, 2);
  
  if (actualNormalized !== expectedNormalized) {
    throw new Error(`${description}\n    Expected:\n${expectedNormalized}\n    Got:\n${actualNormalized}`);
  }
}

test('health response matches golden file', () => {
  const health = createHealthResponse();
  const actual = JSON.stringify(health, null, 2);
  
  const goldenPath = path.join(__dirname, 'test', 'golden', 'health-response.json');
  assertMatchesGolden(actual, goldenPath, {
    VERSION: VERSION,
    ENVIRONMENT: ENVIRONMENT,
    TIMESTAMP: health.timestamp
  }, 'Health response should match golden file');
});

test('app info response matches golden file', () => {
  const info = getAppInfo();
  const actual = JSON.stringify(info, null, 2);
  
  const goldenPath = path.join(__dirname, 'test', 'golden', 'info-response.json');
  assertMatchesGolden(actual, goldenPath, {
    VERSION: VERSION,
    ENVIRONMENT: ENVIRONMENT
  }, 'App info response should match golden file');
});

test('job list response matches golden file structure', () => {
  const jobs = getAllJobs();
  // Validate structure, not exact content (since other tests create jobs)
  assert('pending' in jobs && Array.isArray(jobs.pending), 
    'Jobs list should have pending array');
  assert('completed' in jobs && Array.isArray(jobs.completed), 
    'Jobs list should have completed array');
});

test('created job matches golden file structure', () => {
  const job = createJob('test-type', { key: 'value' });
  // Only validate structure, not dynamic values
  assert(job.id && typeof job.id === 'number', 'Job should have numeric id');
  assert(job.type === 'test-type', 'Job type should match');
  assert(job.data && typeof job.data === 'object', 'Job should have data object');
  assert(job.status === 'pending', 'New job should have pending status');
  assert(job.createdAt && typeof job.createdAt === 'string', 'Job should have createdAt timestamp');
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

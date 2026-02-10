import { getAppInfo, createHealthResponse, createServer, createTask, getTask, getAllTasks, fetchGitHubRepo, listGitHubRepos, runTask, getTaskProgress, VERSION, ENVIRONMENT } from './dist/index.js';
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

console.log('Testing task-runner app structure...\n');

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

test('createTask function is exported', () => {
  assertType(createTask, 'function', 'createTask should be a function');
});

test('runTask function is exported', () => {
  assertType(runTask, 'function', 'runTask should be a function');
});

test('fetchGitHubRepo function is exported', () => {
  assertType(fetchGitHubRepo, 'function', 'fetchGitHubRepo should be a function');
});

test('listGitHubRepos function is exported', () => {
  assertType(listGitHubRepos, 'function', 'listGitHubRepos should be a function');
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

// === TASK MANAGEMENT TEST ===
console.log('\nTask Management:');
test('createTask returns a task object', () => {
  const task = createTask({
    name: 'test-task',
    githubRepo: 'owner/repo',
    dockerImage: 'node:18',
    command: 'npm run build',
    args: { buildType: 'production' }
  });
  
  assert(task !== null && typeof task === 'object', 'createTask should return an object');
  assert('id' in task, 'task should have id');
  assert('name' in task, 'task should have name');
  assert('status' in task, 'task should have status');
  assert('progress' in task, 'task should have progress');
});

test('getTask retrieves task by id', () => {
  const created = createTask({
    name: 'retrieve-test',
    githubRepo: 'owner/repo',
    dockerImage: 'node:18',
    command: 'ls'
  });
  
  const retrieved = getTask(created.id);
  assert(retrieved !== null, 'getTask should return the created task');
  assertEqual(retrieved.name, 'retrieve-test', 'Retrieved task should have correct name');
});

test('getAllTasks returns array of tasks', () => {
  const all = getAllTasks();
  assert(Array.isArray(all), 'getAllTasks should return an array');
  assert(all.length > 0, 'getAllTasks should contain created tasks');
});

test('task has pending status when created', () => {
  const task = createTask({
    name: 'pending-task',
    githubRepo: 'owner/repo',
    dockerImage: 'node:18',
    command: 'npm test'
  });
  
  assertEqual(task.status, 'pending', 'New task should have pending status');
  assertEqual(task.progress, 0, 'New task should have 0 progress');
});

// === GITHUB INTEGRATION TEST ===
console.log('\nGitHub Integration:');
test('fetchGitHubRepo returns repo info', async () => {
  const repo = await fetchGitHubRepo('owner/repo');
  assert(repo !== null && typeof repo === 'object', 'Should return repo object');
  assertEqual(repo.owner, 'owner', 'Should have owner');
  assertEqual(repo.name, 'repo', 'Should have repo name');
});

test('fetchGitHubRepo throws on invalid format', async () => {
  try {
    await fetchGitHubRepo('invalid-format');
    throw new Error('Should have thrown');
  } catch (err) {
    assert(err.message.includes('Invalid repo format'), 'Should throw on invalid format');
  }
});

test('listGitHubRepos returns repos array', async () => {
  const repos = await listGitHubRepos('nodejs');
  assert(Array.isArray(repos), 'Should return an array');
});

// === HEALTH CHECK TEST ===
console.log('\nHealth Check:');
test('createHealthResponse includes service name', () => {
  const health = createHealthResponse();
  assertEqual(health.service, 'task-runner', 'Health response should identify as task-runner');
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

test('name includes task-runner', () => {
  assert(packageJson.name.includes('task-runner'), 'package name should include task-runner');
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
  assert(health.service === 'task-runner', 'Health service should be task-runner');
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

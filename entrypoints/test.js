import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test harness
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}: ${message}`);
  }
}

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    testsPassed++;
  } catch (error) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${error.message}`);
    testsFailed++;
  }
}

console.log('Testing entrypoints CLI structure...\n');

// === FILE STRUCTURE TEST ===
console.log('File structure:');

test('package.json exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'package.json'));
  assert(exists, 'package.json should exist');
});

test('src/cli.js exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'src', 'cli.js'));
  assert(exists, 'src/cli.js should exist');
});

test('src/utils/logger.js exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'src', 'utils', 'logger.js'));
  assert(exists, 'src/utils/logger.js should exist');
});

test('src/commands/list.js exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'src', 'commands', 'list.js'));
  assert(exists, 'src/commands/list.js should exist');
});

test('src/commands/sync.js exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'src', 'commands', 'sync.js'));
  assert(exists, 'src/commands/sync.js should exist');
});

test('README.md exists', () => {
  const exists = fs.existsSync(path.join(__dirname, 'README.md'));
  assert(exists, 'README.md should exist');
});

// === PACKAGE.JSON VALIDATION ===
console.log('\nPackage.json validation:');

test('package.json has valid JSON', () => {
  const content = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
  JSON.parse(content);
});

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

test('name field set correctly', () => {
  assert(packageJson.name.includes('entrypoints'), 'package name should include entrypoints');
});

test('has bin field with ep alias', () => {
  assert(packageJson.bin && packageJson.bin.ep, 'should have ep in bin field');
});

test('has start script', () => {
  assert('start' in packageJson.scripts, 'package.json should have start script');
});

test('has test script', () => {
  assert('test' in packageJson.scripts, 'package.json should have test script');
});

test('has typecheck script', () => {
  assert('typecheck' in packageJson.scripts, 'package.json should have typecheck script');
});

test('packageManager is npm', () => {
  assert(packageJson.packageManager && packageJson.packageManager.startsWith('npm'), 
    'packageManager should be locked to npm');
});

test('type is module (ES modules)', () => {
  assertEqual(packageJson.type, 'module', 'should use ES modules');
});

// === CLI STRUCTURE TEST ===
console.log('\nCLI structure:');

test('cli.js is executable', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'cli.js'), 'utf8');
  assert(content.startsWith('#!/usr/bin/env node'), 'cli.js should have shebang');
});

test('cli.js imports correct modules', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'cli.js'), 'utf8');
  assert(content.includes("import path from 'node:path'"), 'should import node:path');
  assert(content.includes("import fs from 'node:fs'"), 'should import node:fs');
  assert(content.includes("from './utils/logger.js'"), 'should import logger');
});

test('logger.js exports functions', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'utils', 'logger.js'), 'utf8');
  assert(content.includes('export function logInfo'), 'should export logInfo');
  assert(content.includes('export function logSuccess'), 'should export logSuccess');
  assert(content.includes('export function handleError'), 'should export handleError');
  assert(content.includes('export function logVerbose'), 'should export logVerbose');
});

// === COMMANDS TEST ===
console.log('\nCommand exports:');

test('list.js exports execute function', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'commands', 'list.js'), 'utf8');
  assert(content.includes('export async function execute'), 'should export execute function');
});

test('sync.js exports execute function', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'commands', 'sync.js'), 'utf8');
  assert(content.includes('export async function execute'), 'should export execute function');
});

test('list.js has help output', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'commands', 'list.js'), 'utf8');
  assert(content.includes('ep list'), 'should include help text');
});

test('sync.js has help output', () => {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'commands', 'sync.js'), 'utf8');
  assert(content.includes('ep sync'), 'should include help text');
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

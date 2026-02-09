import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version and environment from environment variables or defaults
const version = process.env.VERSION || '0.0.0-dev';
const environment = process.env.ENVIRONMENT || 'development';
const buildTime = process.env.BUILD_TIME || new Date().toISOString();

console.log('Building with metadata:');
console.log(`  Version: ${version}`);
console.log(`  Environment: ${environment}`);
console.log(`  Build Time: ${buildTime}`);

// Read source file
const srcPath = path.join(__dirname, 'src', 'index.js');
const srcContent = fs.readFileSync(srcPath, 'utf8');

// Replace placeholders
const builtContent = srcContent
  .replace(/'__VERSION__'/g, `'${version}'`)
  .replace(/'__ENVIRONMENT__'/g, `'${environment}'`)
  .replace(/'__BUILD_TIME__'/g, `'${buildTime}'`);

// Write to dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const distPath = path.join(distDir, 'index.js');
fs.writeFileSync(distPath, builtContent, 'utf8');

console.log(`Build complete: ${distPath}`);

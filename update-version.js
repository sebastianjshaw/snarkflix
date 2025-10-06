#!/usr/bin/env node
/**
 * Cache Busting Version Updater
 * Automatically updates version parameters in index.html and sw.js
 * Run this before deploying new content to ensure users get fresh data
 */

const fs = require('fs');
const path = require('path');

// Generate version string from current date/time
const now = new Date();
const version = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

console.log(`\n🔄 Updating cache version to: ${version}\n`);

// Update index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace version in script tags
const scriptRegex = /(reviews-data\.js\?v=)[^"]+/g;
const scriptRegex2 = /(script\.js\?v=)[^"]+/g;

indexContent = indexContent.replace(scriptRegex, `$1${version}`);
indexContent = indexContent.replace(scriptRegex2, `$1${version}`);

fs.writeFileSync(indexPath, indexContent);
console.log('✅ Updated index.html script versions');

// Update sw.js
const swPath = path.join(__dirname, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace CACHE_NAME version
const cacheRegex = /(const CACHE_NAME = 'snarkflix-v\d+-)[^']+/;
swContent = swContent.replace(cacheRegex, `$1${version}`);

fs.writeFileSync(swPath, swContent);
console.log('✅ Updated sw.js CACHE_NAME version');

console.log(`\n✨ Cache busting complete! Deploy to see changes.\n`);


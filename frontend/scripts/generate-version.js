// Generate a unique version for each build
// This ensures service worker detects updates

import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Generate version based on timestamp and random string
const timestamp = Date.now();
const random = Math.random().toString(36).substring(2, 9);
const version = `agri-chain-v${timestamp}-${random}`;

// Create version object
const versionData = {
  version,
  timestamp,
  buildDate: new Date().toISOString()
};

// Write to public directory so it's accessible
const publicDir = resolve(process.cwd(), 'public');
const publicPath = resolve(publicDir, 'version.json');
mkdirSync(publicDir, { recursive: true });
writeFileSync(publicPath, JSON.stringify(versionData, null, 2));

console.log(`✅ Generated version: ${version}`);
console.log(`   Build date: ${versionData.buildDate}`);


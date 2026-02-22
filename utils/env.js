/**
 * Environment File Utilities
 * Handles reading and validation of .env files
 */

import fs from 'node:fs';

/**
 * Parse .env file into object
 * @param {string} filePath - Path to .env file
 * @returns {Object} Parsed environment variables
 */
export function parseEnvFile(filePath) {
  if (! fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();

    // Skip empty lines and comments
    if (! line || line.startsWith('#')) {
      return;
    }

    const [key, ...valueParts] = line.split('=');

    if (key) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

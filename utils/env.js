/**
 * Environment File Utilities
 * Handles reading and validation of .env files
 */

import fs from 'node:fs';
import path from 'node:path';

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

/**
 * Get all environment variables for a module
 * @param {string} module - Module name
 * @param {string} envDir - Directory containing .env files
 * @returns {Object} Merged environment variables
 */
export function getModuleEnv(module, envDir) {
  const common = parseEnvFile(path.join(envDir, '.env'));
  const moduleEnv = module !== '.' ? parseEnvFile(path.join(envDir, `.env.${module}`)) : {};

  return { ...common, ...moduleEnv };
}

/**
 * Validate required environment variables
 * @param {Object} env - Environment object
 * @param {string[]} required - Required variable names
 * @throws {Error} If required variables are missing
 */
export function validateRequired(env, required = []) {
  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

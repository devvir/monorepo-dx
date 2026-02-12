/**
 * Docker Command Interface
 * Customized docker compose wrapper for the application
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { getModule, getModules, listModules } from './modules.js';
import { parseEnvFile } from './env.js';
import * as logger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

/**
 * Parse CLI args to extract module name and docker compose flags
 * @param {string[]} args - Process argv slice (default: process.argv.slice(2))
 * @returns {Object} { module, composeArgs, moduleConfig }
 */
export function parseCommandArgs(args = process.argv.slice(2)) {
  let module = '.';
  let composeArgs = [];

  // First positional arg (if not a flag) is the module name
  if (args.length > 0 && ! args[0].startsWith('-')) {
    if (listModules().includes(args[0]) || args[0] === '.') {
      module = args[0];
      composeArgs = args.slice(1);
    } else {
      composeArgs = args;
    }
  } else {
    composeArgs = args;
  }

  // Validate module exists
  const moduleConfig = getModule(module);

  return { module, composeArgs, moduleConfig };
}

/**
 * Run a docker compose command
 * @param {string} module - Module name
 * @param {string} command - Docker compose command (up, down, logs, etc.)
 * @param {string[]} composeArgs - Additional args to pass to docker compose
 * @param {boolean} capture - Whether to capture output (default: false)
 * @returns {string|void} Output if capture=true
 */
export function runDockerCommand(module, command, composeArgs = [], capture = false) {
  const execOptions = {
    module,
    args: [command, ...composeArgs],
    verbose: process.env.VERBOSE === '1'
  };

  return capture ? execCapture(execOptions) : exec(execOptions);
}

/**
 * Execute docker-compose command
 * @param {Object} options - Same as buildComposeCommand
 * @returns {void}
 * @throws {Error} If command fails
 */
function exec(options) {
  const cmd = buildComposeCommand(options);
  execSync(cmd, { stdio: 'inherit' });
}

/**
 * Execute and capture output
 * @param {Object} options - Same as buildComposeCommand
 * @returns {string} Command output
 * @throws {Error} If command fails
 */
function execCapture(options) {
  const cmd = buildComposeCommand(options);

  try {
    return execSync(cmd, { encoding: 'utf-8' });
  } catch (error) {
    throw new Error(`Command failed: ${error.message}`);
  }
}

/**
 * Build docker-compose command arguments
 * @param {Object} options
 * @param {string} options.module - Module name (defaults to '.')
 * @param {string[]} options.args - Additional arguments to pass to docker-compose
 * @param {boolean} options.verbose - Print command before executing
 * @returns {string} Full docker-compose command
 */
export function buildComposeCommand(options = {}) {
  const { module = '.', args = [], verbose = false } = options;

  let composeFile;

  if (module === '.') {
    // Root compose file for full application
    composeFile = path.join(PROJECT_ROOT, 'compose.yml');
  } else {
    // Module-specific compose
    const modules = getModules();
    const moduleConfig = modules[module];

    if (! moduleConfig) {
      const available = Object.keys(modules);
      throw new Error(`Unknown module: ${module}\nAvailable: ${available.join(', ')}`);
    }

    composeFile = path.join(PROJECT_ROOT, moduleConfig.compose);
  }

  // Validate compose file exists
  if (! fs.existsSync(composeFile)) {
    logger.log('');

    if (module === '.') {
      throw new Error(
        'No app-level compose file found.\n\n' +
        'Create a compose.yml file in the root of your project,\n' +
        'or specify a module: npm run dx up <module-name>'
      );
    } else {
      throw new Error(`Compose file not found: ${composeFile}`);
    }
  }

  let cmd = `docker compose -f "${composeFile}"`;

  // Build env file chain: root -> module -> module.<APP_ENV>
  const envFiles = [];

  // 1. Root .env (always load if exists)
  const rootEnv = path.join(PROJECT_ROOT, '.env');
  if (fs.existsSync(rootEnv)) envFiles.push(rootEnv);

  // 2. Module .env (always load if exists and not root module)
  if (module !== '.') {
    const moduleEnv = path.join(PROJECT_ROOT, 'modules', module, '.env');
    if (fs.existsSync(moduleEnv)) envFiles.push(moduleEnv);

    // 3. Module .env.<APP_ENV> (only if APP_ENV is set in root .env)
    if (fs.existsSync(rootEnv)) {
      const rootEnvVars = parseEnvFile(rootEnv);
      const appEnv = rootEnvVars.APP_ENV;

      if (appEnv) {
        const envSpecificFile = path.join(PROJECT_ROOT, 'modules', module, `.env.${appEnv}`);
        if (fs.existsSync(envSpecificFile)) envFiles.push(envSpecificFile);
      }
    }
  }

  // Add all env files to command
  for (const envFile of envFiles) {
    cmd += ` --env-file "${envFile}"`;
  }

  // Add additional arguments
  if (args.length > 0) {
    cmd += ` ${args.map(arg => `"${arg}"`).join(' ')}`;
  }

  if (verbose) logger.info(`$ ${cmd}`);

  return cmd;
}

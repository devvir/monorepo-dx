/**
 * Service and Module Discovery
 * Scans directories to find services and modules
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseComposeFile } from './compose-parser.js';
import { readDescription } from './metadata.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

// Allow customization via environment variables, with defaults
const SERVICES_DIR = process.env.DX_SERVICES_DIR
  ? path.resolve(process.env.DX_SERVICES_DIR)
  : path.join(PROJECT_ROOT, 'services');

const MODULES_DIR = process.env.DX_MODULES_DIR
  ? path.resolve(process.env.DX_MODULES_DIR)
  : path.join(PROJECT_ROOT, 'modules');

/**
 * Check whether a service or module directory is marked to be skipped
 * when running commands without a filter.
 * @param {string} dirPath - Absolute path to the service or module directory
 * @returns {boolean}
 */
export function isSkipped(dirPath) {
  return fs.existsSync(path.join(dirPath, '.dxskip'));
}

/**
 * Discover all services by scanning services/ directory
 * @returns {Object} Map of services
 */
export function discoverServices() {
  const services = {};

  if (! fs.existsSync(SERVICES_DIR)) return services;

  const entries = fs.readdirSync(SERVICES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (! entry.isDirectory() || entry.name.startsWith('.')) continue;

    const serviceName = entry.name;
    const servicePath = path.join(SERVICES_DIR, serviceName);
    const composePath = path.join(servicePath, 'docker', 'compose.yml');
    const packageJsonPath = path.join(servicePath, 'package.json');
    const srcPath = path.join(servicePath, 'src');
    const appPath = path.join(servicePath, 'app');

    // Determine if infrastructure service by checking for development artifacts
    // Application services have package.json and src/ or app/
    // Infrastructure services typically only have docker configuration
    const isApplication = fs.existsSync(packageJsonPath) || fs.existsSync(srcPath) || fs.existsSync(appPath);
    const isInfrastructure = ! isApplication;

    // Get compose file info
    const { image, port } = parseComposeFile(composePath);

    // Get description
    const description = readDescription(servicePath) || `${serviceName} service`;

    services[serviceName] = {
      path: servicePath,
      description,
      image,
      port,
      infrastructure: isInfrastructure,
      hasCompose: fs.existsSync(composePath),
      hasPackageJson: fs.existsSync(packageJsonPath)
    };
  }

  return services;
}

/**
 * Discover all modules by scanning modules/ directory
 * @returns {Object} Map of modules
 */
export function discoverModules() {
  const modules = {};

  if (!fs.existsSync(MODULES_DIR)) return modules;

  const entries = fs.readdirSync(MODULES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

    const moduleName = entry.name;
    const modulePath = path.join(MODULES_DIR, moduleName);
    const composePath = path.join(modulePath, 'compose.yml');

    const description = readDescription(modulePath) || `${moduleName} module`;

    modules[moduleName] = {
      path: modulePath,
      description,
      compose: `modules/${moduleName}/compose.yml`,
      hasCompose: fs.existsSync(composePath)
    };
  }

  return modules;
}

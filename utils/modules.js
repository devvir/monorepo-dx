/**
 * Service and Module API
 * High-level interface for working with services and modules
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseModuleServices } from './compose-parser.js';
import { discoverServices, discoverModules } from './discovery.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

/**
 * Get all services
 */
export function getServices() {
  return discoverServices();
}

/**
 * Get all modules
 */
export function getModules() {
  return discoverModules();
}

/**
 * Get all service names
 * @returns {string[]} Array of service names
 */
export function listServices() {
  return Object.keys(getServices());
}

/**
 * Get all module names
 * @returns {string[]} Array of module names
 */
export function listModules() {
  return Object.keys(getModules());
}

/**
 * Validate and get service configuration
 * @param {string} serviceName - Service name
 * @returns {Object} Service configuration
 * @throws {Error} If service not found
 */
export function getService(serviceName) {
  const services = getServices();
  const service = services[serviceName];

  if (! service) {
    const available = Object.keys(services);

    throw new Error(`Unknown service: ${serviceName}\nAvailable: ${available.join(', ')}`);
  }

  return service;
}

/**
 * Validate and get module configuration (with services)
 * @param {string} moduleName - Module name
 * @returns {Object} Module configuration with services list
 * @throws {Error} If module not found
 */
export function getModule(moduleName) {
  const modules = getModules();
  const module = modules[moduleName];

  if (! module) {
    const available = Object.keys(modules);

    throw new Error(`Unknown module: ${moduleName}\nAvailable: ${available.join(', ')}`);
  }

  // Add services list to module config
  return {
    ...module,
    services: parseModuleServices(path.join(module.path, 'compose.yml'))
  };
}

/**
 * Get services included in a module by parsing its compose.yml
 * @param {string} moduleName - Module name
 * @returns {string[]} Array of service names
 */
export function getModuleServices(moduleName) {
  const module = getModule(moduleName);
  const composePath = path.join(module.path, 'compose.yml');

  return parseModuleServices(composePath);
}

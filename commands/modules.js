import { listModules, getModules } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx modules [OPTIONS]
  List all deployment modules

  Options:
    -v, --verbose           Show more details (path, compose file)`;
}

export function main() {
  const modules = getModules();
  const moduleNames = listModules();

  if (moduleNames.length === 0) {
    logger.warn('No modules found');
    return;
  }

  logger.section('Available Modules');

  moduleNames.forEach(name => {
    const config = modules[name];

    logger.pair(name.padEnd(15), config.description);

    if (process.env.VERBOSE) {
      logger.log(`  ${''.padEnd(15)} Path: ${config.path}`);
      logger.log(`  ${''.padEnd(15)} Compose: ${config.compose}`);
    }
  });

  logger.log('');
  logger.log('Use: npm run dx up -- <MODULE>     # Start a module');
}

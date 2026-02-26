import { listModules, getModules } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

/**
 * List all deployment modules.
 */
export function action() {
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
  const executor = process.env.DX_EXECUTOR || 'dx';
  logger.log(`Use: ${executor} up <MODULE>     # Start a module`);
}

export function register(program) {
  program
    .command('modules')
    .description('List all deployment modules')
    .action(action);
}

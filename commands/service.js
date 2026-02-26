import { getService } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

/**
 * Show detailed information about a service.
 *
 * @param {string} name - Service name
 */
export function action(name) {
  const service = getService(name);

  logger.section(`Service: ${name}`);

  logger.pair('Description:', service.description);
  logger.pair('Image:', service.image || '(unknown)');
  logger.pair('Port:', service.port || '(unknown)');
  logger.pair('Type:', service.infrastructure ? 'Infrastructure' : 'Application');
  logger.pair('Path:', service.path);

  if (process.env.VERBOSE) {
    logger.pair('Has compose:', service.hasCompose ? 'Yes' : 'No');
    logger.pair('Has package.json:', service.hasPackageJson ? 'Yes' : 'No');
  }
}

export function register(program) {
  program
    .command('service <name>')
    .description('Show detailed information about a service')
    .action((name) => {
      try {
        action(name);
      } catch (err) {
        logger.fatal(err.message);
      }
    });
}

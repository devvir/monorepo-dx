import { listServices, getServices } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

/**
 * List all available services.
 */
export function action() {
  const services = getServices();
  const serviceNames = listServices();

  if (serviceNames.length === 0) {
    logger.warn('No services found');
    return;
  }

  logger.section('Available Services');

  serviceNames.forEach(name => {
    const config = services[name];
    const tag = config.infrastructure ? ' [infra]' : '';

    logger.log(`  ${name.padEnd(15)} ${config.description}${tag}`);

    if (process.env.VERBOSE) {
      logger.log(`  ${''.padEnd(15)} Port: ${config.port}, Image: ${config.image}`);
    }
  });

  logger.log('');
  const executor = process.env.DX_EXECUTOR || 'dx';
  logger.log(`Use: ${executor} service <NAME>  # Get details about a service`);
}

export function register(program) {
  program
    .command('services')
    .description('List all available services')
    .action(action);
}

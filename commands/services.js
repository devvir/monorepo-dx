import { listServices, getServices } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx services [OPTIONS]
  List all available services

  Options:
    -v, --verbose           Show more details (port, image)`;
}

export function main() {
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
  logger.log('Use: pnpm run dx service -- <NAME>  # Get details about a service');
}


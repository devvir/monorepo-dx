import { getService } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx service -- <NAME> [OPTIONS]
  Show detailed information about a service

  Options:
    -v, --verbose           Show additional metadata

  Examples:
    pnpm run dx service -- myservice  # MyService service details
    pnpm run dx service -- rabbitmq   # RabbitMQ details
    pnpm run dx service -- mongodb    # MongoDB details
    pnpm run dx service -- myservice -v # With additional info`;
}

export function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      logger.error('Usage: pnpm run dx service -- <NAME>');

      process.exit(0);
    }

    const serviceName = args[0];
    const service = getService(serviceName);

    logger.section(`Service: ${serviceName}`);

    logger.pair('Description:', service.description);
    logger.pair('Image:', service.image || '(unknown)');
    logger.pair('Port:', service.port || '(unknown)');
    logger.pair('Type:', service.infrastructure ? 'Infrastructure' : 'Application');
    logger.pair('Path:', service.path);

    if (process.env.VERBOSE) {
      logger.pair('Has compose:', service.hasCompose ? 'Yes' : 'No');
      logger.pair('Has package.json:', service.hasPackageJson ? 'Yes' : 'No');
    }

  } catch (err) {
    logger.fatal(err.message);
  }
}

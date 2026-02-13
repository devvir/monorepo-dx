import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx up [MODULE] [OPTIONS]
  Start services

  Examples:
    npm run dx up reader          # Reader module
    npm run dx up socket -d       # Socket, detached`;
}

export function main() {
  try {
    const { module, composeArgs, moduleConfig } = parseCommandArgs();

    // Determine if a single service is being started (e.g., tb up reader rabbitmq)
    // Find first positional arg after module that is not a flag
    const requestedServices = composeArgs.filter(arg => !arg.startsWith('-') && !arg.includes('='));
    const isSingleService = requestedServices.length === 1 && moduleConfig.services && moduleConfig.services.includes(requestedServices[0]);

    if (isSingleService) {
      logger.section(`Starting single service from module: ${module}`);
      logger.pair('Module:', module);
      logger.pair('Service:', requestedServices[0]);
    } else {
      logger.section(`Starting ${moduleConfig.description}`);
      logger.pair('Module:', module === '.' ? '(full app)' : module);
      logger.pair('Services:', moduleConfig.services ? moduleConfig.services.join(', ') : '');
    }

    runDockerCommand(module, 'up', composeArgs);
  } catch (err) {
    logger.fatal(err.message);
  }
}

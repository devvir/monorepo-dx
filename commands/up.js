import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx up [MODULE] [OPTIONS]
  Start services

  Examples:
    pnpm run dx up mymodule        # MyModule module
    pnpm run dx up socket -d       # Socket, detached`;
}

export function main() {
  try {
    const { module, composeArgs, moduleConfig } = parseCommandArgs();

    // Determine if a single service is being started (e.g., tb up mymodule rabbitmq)
    // Find first positional arg after module that is not a flag
    const requestedServices = composeArgs.filter(arg => ! arg.startsWith('-') && ! arg.includes('='));
    const isSingleService = requestedServices.length === 1 && moduleConfig?.services?.includes(requestedServices[0]);

    if (isSingleService) {
      logger.section(`Starting single service from module: ${module}`);
      logger.pair('Module:', module);
      logger.pair('Service:', requestedServices[0]);
    } else if (module) {
      logger.section(`Starting ${moduleConfig.description}`);
      logger.pair('Module:', module);
      logger.pair('Services:', moduleConfig.services.join(', '));
    } else {
      logger.section('Starting all modules');
    }

    runDockerCommand(module, 'up', composeArgs);
  } catch (err) {
    logger.fatal(err.message);
  }
}

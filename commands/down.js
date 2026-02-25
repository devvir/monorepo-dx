import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx down [MODULE] [OPTIONS]
  Stop services

  Examples:
    pnpm run dx down mymodule      # Stop mymodule module
    pnpm run dx down socket        # Stop socket`;
}

export function main() {
  try {
    const { module, composeArgs, moduleConfig } = parseCommandArgs();

    logger.section(module ? `Stopping ${moduleConfig.description}` : 'Stopping all modules');
    if (module) logger.pair('Module:', module);

    runDockerCommand(module, 'down', composeArgs);

    logger.success('Services stopped');
  } catch (err) {
    logger.error(err.message);
    process.exit(0);
  }
}

import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx down [MODULE] [OPTIONS]
  Stop services

  Examples:
    npm run dx down reader        # Stop reader
    npm run dx down socket        # Stop socket`;
}

export function main() {
  try {
    const { module, composeArgs, moduleConfig } = parseCommandArgs();

    logger.section(`Stopping ${moduleConfig.description}`);
    logger.pair('Module:', module === '.' ? '(full app)' : module);

    runDockerCommand(module, 'down', composeArgs);

    logger.success('Services stopped');
  } catch (err) {
    logger.error(err.message);
    process.exit(0);
  }
}

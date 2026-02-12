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

    logger.section(`Starting ${moduleConfig.description}`);
    logger.pair('Module:', module === '.' ? '(full app)' : module);
    logger.pair('Services:', moduleConfig.services.join(', '));

    runDockerCommand(module, 'up', composeArgs);
  } catch (err) {
    logger.fatal(err.message);
  }
}

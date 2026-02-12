import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx logs [MODULE] [OPTIONS]
  View service logs

  Examples:
    npm run dx logs reader        # Reader logs
    npm run dx logs socket -f     # Follow socket logs
    npm run dx logs -- -t 20      # Last 20 lines`;
}

export function main() {
  try {
    const { module, composeArgs } = parseCommandArgs();

    runDockerCommand(module, 'logs', composeArgs);
  } catch (err) {
    logger.fatal(err.message);
  }
}

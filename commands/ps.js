import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx ps [MODULE]
  List running services

  Examples:
    npm run dx ps              # All services
    npm run dx ps reader       # Reader module services`;
}

export function main() {
  try {
    const { module, composeArgs } = parseCommandArgs();

    runDockerCommand(module, 'ps', composeArgs);
  } catch (err) {
    logger.error(err.message);
    process.exit(0);
  }
}

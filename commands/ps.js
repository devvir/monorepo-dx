import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx ps [MODULE]
  List running services

  Examples:
    pnpm run dx ps              # All services
    pnpm run dx ps mymodule     # Services for module mymodule`;
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

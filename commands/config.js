import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx config [MODULE]
  Show resolved docker-compose configuration

  Examples:
    npm run dx config          # Full app config
    npm run dx config reader   # Reader module config`;
}

export function main() {
  try {
    const { module, composeArgs, moduleConfig } = parseCommandArgs();

    logger.section(`Configuration for ${moduleConfig.description}`);
    logger.log(runDockerCommand(module, 'config', composeArgs, true));
  } catch (err) {
    logger.error(err.message);
    process.exit(0);
  }
}

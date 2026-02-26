import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

/**
 * Show resolved docker-compose configuration.
 *
 * @param {string[]} args - Raw args (module detection + docker compose passthrough)
 */
export function action(args) {
  const { module, composeArgs, moduleConfig } = parseCommandArgs(args);

  const label = moduleConfig ? moduleConfig.description : 'all modules';
  logger.section(`Configuration for ${label}`);
  logger.log(runDockerCommand(module, 'config', composeArgs, true));
}

export function register(program) {
  program
    .command('config')
    .description('Show resolved docker-compose configuration')
    .allowUnknownOption()
    .allowExcessArguments()
    .action((options, cmd) => {
      try {
        action(cmd.args);
      } catch (err) {
        logger.error(err.message);
        process.exit(0);
      }
    });
}

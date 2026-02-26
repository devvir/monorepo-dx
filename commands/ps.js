import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

/**
 * List running services.
 *
 * @param {string[]} args - Raw args (module detection + docker compose passthrough)
 */
export function action(args) {
  const { module, composeArgs } = parseCommandArgs(args);

  runDockerCommand(module, 'ps', composeArgs);
}

export function register(program) {
  program
    .command('ps')
    .description('List running services')
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

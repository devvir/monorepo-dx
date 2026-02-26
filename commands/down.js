import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import * as logger from '../utils/logger.js';

/**
 * Stop services.
 *
 * @param {string[]} args - Raw args (module detection + docker compose passthrough)
 */
export function action(args) {
  const { module, composeArgs, moduleConfig } = parseCommandArgs(args);

  logger.section(module ? `Stopping ${moduleConfig.description}` : 'Stopping all modules');
  if (module) logger.pair('Module:', module);

  runDockerCommand(module, 'down', composeArgs);

  logger.success('Services stopped');
}

export function register(program) {
  program
    .command('down')
    .description('Stop services')
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

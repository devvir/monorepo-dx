import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import { runForTarget } from '../utils/runner.js';
import * as logger from '../utils/logger.js';

/**
 * Start services, optionally installing dependencies and building first.
 *
 * @param {string[]} args - Raw args (module detection + docker compose passthrough)
 * @param {object} options - Parsed options
 * @param {boolean} [options.install] - Run install + build before starting
 */
export function action(args, options = {}) {
  const { module, composeArgs, moduleConfig } = parseCommandArgs(args);

  if (options.install) {
    logger.section('Installing dependencies...');
    runForTarget(module, { script: 'install.sh', pnpmCmd: 'install', label: 'Installing' });

    logger.section('Building...');
    runForTarget(module, { script: 'build.sh', pnpmCmd: 'build', label: 'Building' });
  }

  const requestedServices = composeArgs.filter(arg => ! arg.startsWith('-') && ! arg.includes('='));
  const isSingleService = requestedServices.length === 1 && moduleConfig?.services?.includes(requestedServices[0]);

  if (isSingleService) {
    logger.section(`Starting single service from module: ${module}`);
    logger.pair('Module:', module);
    logger.pair('Service:', requestedServices[0]);
  } else if (module) {
    logger.section(`Starting ${moduleConfig.description}`);
    logger.pair('Module:', module);
    logger.pair('Services:', moduleConfig.services.join(', '));
  } else {
    logger.section('Starting all modules');
  }

  runDockerCommand(module, 'up', composeArgs);
}

export function register(program) {
  program
    .command('up')
    .description('Start services')
    .option('-i, --install', 'Install dependencies and build before starting')
    .allowUnknownOption()
    .allowExcessArguments()
    .action((options, cmd) => {
      try {
        action(cmd.args, options);
      } catch (err) {
        logger.fatal(err.message);
      }
    });
}

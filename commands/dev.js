import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import { runForTarget } from '../utils/runner.js';
import * as logger from '../utils/logger.js';

/**
 * Install dependencies, build, and start services.
 *
 * @param {string[]} args - Raw args (module detection + docker compose passthrough)
 */
export function action(args) {
  const { module, composeArgs, moduleConfig } = parseCommandArgs(args);

  logger.section('Development Setup');
  if (module) {
    logger.pair('Module:', module);
    logger.pair('Services:', moduleConfig.services.join(', '));
  } else {
    logger.pair('Module:', '(all)');
  }

  // Step 1: Install dependencies
  logger.log('\n→ Installing dependencies...');
  runForTarget(module, { script: 'install.sh', pnpmCmd: 'install', label: 'Installing' });
  logger.success('Dependencies installed');

  // Step 2: Build all services
  logger.log('\n→ Building services...');
  runForTarget(module, { script: 'build.sh', pnpmCmd: 'build', label: 'Building' });
  logger.success('Build complete');

  // Step 3: Start services
  logger.log('\n→ Starting services...');
  runDockerCommand(module, 'up', composeArgs);

  logger.success('Services started');
}

export function register(program) {
  program
    .command('dev')
    .description('Install dependencies, build, and start services')
    .allowUnknownOption()
    .allowExcessArguments()
    .action((options, cmd) => {
      try {
        action(cmd.args);
      } catch (err) {
        logger.fatal(err.message);
      }
    });
}

import { parseCommandArgs, runDockerCommand } from '../utils/docker.js';
import { runCommand } from '../utils/runner.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx dev [MODULE] [OPTIONS]
  Install dependencies, build, and start services

  Examples:
    pnpm run dx dev mymodule        # MyModule module
    pnpm run dx dev mymodule -d     # MyModule module, detached`;
}

export function main() {
  try {
    const argsForModule = process.argv.slice(2);
    const { module, composeArgs, moduleConfig } = parseCommandArgs();

    logger.section('Development Setup');
    if (module) {
      logger.pair('Module:', module);
      logger.pair('Services:', moduleConfig.services.join(', '));
    } else {
      logger.pair('Module:', '(all)');
    }

    // Step 1: Install dependencies
    logger.log('\n→ Installing dependencies...');
    runCommand(argsForModule, { script: 'install.sh', pnpmCmd: 'install', label: 'Installing' });
    logger.success('Dependencies installed');

    // Step 2: Build all services
    logger.log('\n→ Building services...');
    runCommand(argsForModule, { script: 'build.sh', pnpmCmd: 'build', label: 'Building' });
    logger.success('Build complete');

    // Step 3: Start services
    logger.log('\n→ Starting services...');
    runDockerCommand(module, 'up', composeArgs);

    logger.success('Services started');
  } catch (err) {
    logger.fatal(err.message);
  }
}


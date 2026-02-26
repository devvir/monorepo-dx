import { runForTarget } from '../utils/runner.js';
import * as logger from '../utils/logger.js';

/**
 * Build a service or all services in a module.
 *
 * @param {string|undefined} target - Service or module name (undefined = all)
 * @param {string[]} [extraArgs] - Extra args to forward (typically after --)
 */
export function action(target, extraArgs = []) {
  runForTarget(target, { script: 'build.sh', pnpmCmd: 'build', label: 'Building', extraArgs });
}

export function register(program) {
  program
    .command('build [target]')
    .description('Build a service or all services in a module')
    .allowExcessArguments()
    .allowUnknownOption()
    .action((target, options, cmd) => {
      try {
        const extraArgs = target ? cmd.args.slice(1) : cmd.args;
        action(target, extraArgs);
      } catch (err) {
        logger.fatal(err.message);
      }
    });
}

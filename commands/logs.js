import { runDockerCommand } from '../utils/docker.js';
import { listModules } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

/**
 * View service logs. Module name can appear anywhere in args.
 *
 * @param {string[]} args - Raw args (module detected anywhere + docker compose passthrough)
 */
export function action(args) {
  let module = null;
  let logArgs = [];

  for (let i = 0; i < args.length; i++) {
    if (! args[i].startsWith('-') && listModules().includes(args[i])) {
      module = args[i];
      logArgs = [...args.slice(0, i), ...args.slice(i + 1)];
      break;
    }
  }

  if (logArgs.length === 0 && ! module) {
    logArgs = args;
  }

  runDockerCommand(module, 'logs', logArgs);
}

export function register(program) {
  program
    .command('logs')
    .description('View service logs')
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

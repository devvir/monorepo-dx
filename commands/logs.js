import { buildComposeCommand, runDockerCommand } from '../utils/docker.js';
import { getModule, listModules } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx logs [MODULE] [OPTIONS]
  View service logs

  Examples:
    pnpm run dx logs mymodule       # Logs for module mymodule
    pnpm run dx logs mymodule -f    # Follow logs for module mymodule
    pnpm run dx logs -- -t 20       # Last 20 lines`;
}

export function main() {
  try {
    const args = process.argv.slice(2);
    let module = null;
    let logArgs = [];

    // Look for a module name anywhere in the args
    for (let i = 0; i < args.length; i++) {
      if (! args[i].startsWith('-') && listModules().includes(args[i])) {
        module = args[i];
        // Remove module from args
        logArgs = [...args.slice(0, i), ...args.slice(i + 1)];
        break;
      }
    }

    // If no module found, use all args as log options
    if (logArgs.length === 0 && ! module) {
      logArgs = args;
    }

    runDockerCommand(module, 'logs', logArgs);
  } catch (err) {
    logger.error(err.message);
    process.exit(0);
  }
}

import { listServices, listModules } from '../utils/modules.js';
import { runCommand } from '../utils/runner.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx build [name] [-- args]
  Build a service or all services in a module.
  If the service has a build.sh, it runs that (instead of pnpm, even for node services).
  Otherwise, if it's a node service, delegates to pnpm build.
  Extra args after -- are passed to the build script or pnpm.

  Examples:
    pnpm run dx build                     # Build all services
    pnpm run dx build feed                # Build feed service
    pnpm run dx build reader              # Build all services in the reader module
    pnpm run dx build feed -- --verbose   # Pass --verbose to feed's build

  Services: ${listServices().join(', ')}
  Modules:  ${listModules().join(', ')}`;
}

export function main() {
  try {
    runCommand(process.argv.slice(2), { script: 'build.sh', pnpmCmd: 'build', label: 'Building' });
  } catch (err) {
    logger.fatal(err.message);
  }
}

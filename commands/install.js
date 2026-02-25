import { listServices, listModules } from '../utils/modules.js';
import { runCommand } from '../utils/runner.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx install [name] [-- args]
  Install a service or all services in a module.
  If the service has an install.sh, it runs that (instead of pnpm, even for node services).
  Otherwise, if it's a node service, delegates to pnpm install.
  Extra args after -- are passed to the install script or pnpm.

  Examples:
    pnpm run dx install                         # Install all services
    pnpm run dx install myservice               # Install myservice service
    pnpm run dx install mymodule                # Install all services in the mymodule module
    pnpm run dx install myservice -- --frozen   # Pass --frozen to myservice's install

  Services: ${listServices().join(', ')}
  Modules:  ${listModules().join(', ')}`;
}

export function main() {
  try {
    runCommand(process.argv.slice(2), { script: 'install.sh', pnpmCmd: 'install', label: 'Installing' });
  } catch (err) {
    logger.fatal(err.message);
  }
}

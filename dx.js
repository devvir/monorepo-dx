/**
 * DX (Developer Experience) - Main entry point for all CLI commands
 *
 * Uses Commander for argument parsing and subcommand routing.
 */

import { Command } from 'commander';
import { register as registerUp } from './commands/up.js';
import { register as registerDown } from './commands/down.js';
import { register as registerLogs } from './commands/logs.js';
import { register as registerPs } from './commands/ps.js';
import { register as registerConfig } from './commands/config.js';
import { register as registerBuild } from './commands/build.js';
import { register as registerInstall } from './commands/install.js';
import { register as registerTest } from './commands/test.js';
import { register as registerDev } from './commands/dev.js';
import { register as registerModules } from './commands/modules.js';
import { register as registerModule } from './commands/module.js';
import { register as registerServices } from './commands/services.js';
import { register as registerService } from './commands/service.js';
import { listModules, getModules } from './utils/modules.js';

const program = new Command();

program
  .name(process.env.DX_EXECUTOR || 'dx')
  .version('0.1.0')
  .description('Infrastructure and deployment orchestration')
  .option('-v, --verbose', 'Verbose output');

program.hook('preAction', () => {
  if (program.opts().verbose) {
    process.env.VERBOSE = '1';
  }
});

registerUp(program);
registerDown(program);
registerLogs(program);
registerPs(program);
registerConfig(program);
registerBuild(program);
registerInstall(program);
registerTest(program);
registerDev(program);
registerModules(program);
registerModule(program);
registerServices(program);
registerService(program);

// Append module listing to help output
const modules = getModules();
const moduleNames = listModules();

if (moduleNames.length > 0) {
  const moduleList = moduleNames
    .map(name => `  ${name.padEnd(15)} ${modules[name].description}`)
    .join('\n');
  program.addHelpText('after', `\nModules:\n${moduleList}\n`);
}

// Show help and exit cleanly when no arguments are given
if (process.argv.length <= 2) {
  program.help();
}

program.parse();

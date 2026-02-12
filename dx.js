/**
 * DX (Developer Experience) - Main entry point for all CLI commands
 *
 * Routes command requests to appropriate command modules.
 * This allows `dx <command> [args]` to work seamlessly.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandsDir = path.join(__dirname, 'commands');

async function main() {
  setVerbosity();

  const commandName = process.argv[2] || 'help';
  const commandPath = path.join(commandsDir, `${commandName}.js`);

  try {
    const commandModule = await import(`file://${commandPath}`);

    if (! ('main' in commandModule)) {
      logger.fatal(`Command '${commandName}' does not export main() function`);
    }

    // Shift argv so that the command sees its arguments in argv[2]
    // Remove: node, dx.js, command-name
    process.argv.splice(2, 1);

    await commandModule.main();
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message.includes('not found')) {
      logger.fatal(`Unknown command: ${commandName}`);
    }

    logger.fatal(err.message);
  }
}

function setVerbosity() {
  const verboseIndex = process.argv.findIndex(arg => arg === '-v' || arg === '--verbose');

  if (verboseIndex !== -1) {
    process.env.VERBOSE = '1';
    process.argv.splice(verboseIndex, 1);
  }
}

main().catch(err => {
  logger.fatal(`Unexpected error: ${err.message}`);
});

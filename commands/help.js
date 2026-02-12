import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listModules, getModules } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function help() {
  return `npm run dx help
  Show this help message`;
}

export async function main() {
  const modules = getModules();
  const moduleNames = listModules();

  logger.section('Orchestration');
  logger.log('Available modules:');

  moduleNames.forEach(
    name => logger.pair(name.padEnd(15), modules[name].description)
  );

  logger.section('Commands');

  // Scan commands directory and load help from each
  const files = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.js') && f !== 'help.js')
    .sort();

  for (const file of files) {
    const modulePath = path.join(__dirname, file);

    try {
      const module = await import(`file://${modulePath}`);

      if ('help' in module) {
        const helpText = module.help();
        logger.log(helpText);
        logger.log('');
      }
    } catch (err) {
      logger.error(`Failed to load help from ${file}: ${err.message}`);
    }
  }
}

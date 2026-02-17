import marked from 'cli-markdown';
import { getModule, getModuleServices } from '../utils/modules.js';
import * as logger from '../utils/logger.js';
import { readReadme } from '../utils/metadata.js';

export function help() {
  return `pnpm run dx module -- <NAME>
  Show detailed information about a module

  Examples:
    pnpm run dx module -- reader     # Reader module details
    pnpm run dx module -- socket     # Socket module details`;
}

export function main() {
  const moduleName = process.argv[2];

  if (! moduleName) {
    logger.error('Module name required\nUsage: pnpm run dx module -- <MODULE_NAME>');

    process.exit(0);
  }

  try {
    const module = getModule(moduleName);

    logger.section(moduleName);
    logger.log(module.description);

    const services = getModuleServices(moduleName);

    if (services.length > 0) {
      logger.section('Services');

      services.forEach(service => {
        logger.log(`  • ${service}`);
      });
    }

    const readme = readReadme(module.path);

    if (readme) {
      logger.section('README');
      logger.log(marked(readme));
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(0);
  }
}

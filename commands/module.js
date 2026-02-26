import marked from 'cli-markdown';
import { getModule, getModuleServices } from '../utils/modules.js';
import * as logger from '../utils/logger.js';
import { readReadme } from '../utils/metadata.js';

/**
 * Show detailed information about a module.
 *
 * @param {string} name - Module name
 */
export function action(name) {
  const module = getModule(name);

  logger.section(name);
  logger.log(module.description);

  const services = getModuleServices(name);

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
}

export function register(program) {
  program
    .command('module <name>')
    .description('Show detailed information about a module')
    .action((name) => {
      try {
        action(name);
      } catch (error) {
        logger.error(error.message);
        process.exit(0);
      }
    });
}

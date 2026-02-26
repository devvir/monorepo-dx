import { execSync } from 'node:child_process';
import { getServices, getService, getModuleServices } from '../utils/modules.js';
import { hasNpmScript } from '../utils/metadata.js';
import * as logger from '../utils/logger.js';

/**
 * Run tests for services that define an npm test script.
 *
 * @param {string|undefined} service - Service name (undefined = all)
 * @param {object} options - Parsed options
 * @param {string} [options.module] - Module name to test
 */
export async function action(service, options = {}) {
  const config = resolveTestConfig(service, options);
  const serviceNames = getServicesToTest(config);

  if (serviceNames.length === 0) {
    logger.info('No services with test scripts found');
    process.exit(0);
  }

  logger.section(`Testing ${serviceNames.length} service(s)`);

  const allServices = getServices();
  const results = serviceNames.map(name =>
    runServiceTest(name, allServices[name])
  );

  reportResults(results);
}

function resolveTestConfig(service, options) {
  if (options.module) {
    return { mode: 'module', target: options.module };
  }
  if (service) {
    return { mode: 'service', target: service };
  }
  return { mode: 'all' };
}

function getServicesToTest({ mode, target }) {
  const allServices = getServices();

  if (mode === 'all') {
    return Object.entries(allServices)
      .filter(([_, service]) => hasNpmScript(service, 'test'))
      .map(([name]) => name);
  }

  if (mode === 'module') {
    const moduleServices = getModuleServices(target);
    const testableServices = moduleServices.filter(name => {
      const service = allServices[name];
      return service && hasNpmScript(service, 'test');
    });

    if (testableServices.length === 0) {
      logger.info(`No services with test scripts found in module: ${target}`);
      process.exit(0);
    }

    return testableServices;
  }

  // mode === 'service'
  const service = getService(target);
  if (! hasNpmScript(service, 'test')) {
    logger.error(`Service '${target}' does not define an npm test script`);
    process.exit(1);
  }

  return [target];
}

function runServiceTest(serviceName, service) {
  logger.log(`\n→ Testing ${serviceName}...`);

  try {
    execSync('pnpm run test', {
      cwd: service.path,
      stdio: 'inherit',
      env: process.env
    });

    logger.success(`${serviceName} tests passed`);
    return { name: serviceName, passed: true };
  } catch (err) {
    logger.error(`${serviceName} tests failed`);
    return { name: serviceName, passed: false };
  }
}

function reportResults(results) {
  const passCount = results.filter(r => r.passed).length;
  const failCount = results.filter(r => ! r.passed).length;

  logger.section(`Results: ${passCount} passed, ${failCount} failed`);

  if (failCount > 0) {
    logger.info('Failed services:');
    results
      .filter(r => ! r.passed)
      .forEach(r => logger.log(`  • ${r.name}`));

    process.exit(1);
  }

  logger.success(`✓ All ${passCount} test suite(s) passed`);
}

export function register(program) {
  program
    .command('test [service]')
    .description('Run tests for services that define an npm test script')
    .option('-m, --module <name>', 'Run tests for all services in a module')
    .action(async (service, options) => {
      try {
        await action(service, options);
      } catch (err) {
        logger.fatal(err.message);
      }
    });
}

import { execSync } from 'node:child_process';
import { getServices, getService, getModuleServices } from '../utils/modules.js';
import { hasNpmScript } from '../utils/metadata.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `npm run dx test [OPTIONS] [SERVICE]
  Run tests for services that define an npm test script

  Options:
    -m, --module <NAME>     Run tests for all services in a module

  Examples:
    npm run dx test                 # All services with test scripts
    npm run dx test -m reader       # All services in the reader module
    npm run dx test archivist       # Run tests for archivist service only`;
}

export async function main() {
  try {
    const config = parseArgs(process.argv.slice(2));
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
  } catch (err) {
    logger.fatal(err.message);
  }
}

/**
 * Parse command arguments to determine test mode and targets
 */
function parseArgs(args) {
  if (args.length === 0) {
    return { mode: 'all' };
  }

  if (args[0] === '-m' || args[0] === '--module') {
    if (! args[1]) {
      logger.error('Module name required\nUsage: npm run dx test -m <MODULE_NAME>');
      process.exit(1);
    }
    return { mode: 'module', target: args[1] };
  }

  return { mode: 'service', target: args[0] };
}

/**
 * Get list of services to test based on parsed arguments
 */
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

/**
 * Run tests for a single service
 */
function runServiceTest(serviceName, service) {
  logger.log(`\n→ Testing ${serviceName}...`);

  try {
    execSync('npm run test', {
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

/**
 * Report test results and exit with appropriate code
 */
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

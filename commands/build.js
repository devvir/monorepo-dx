import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getServices } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx build
  Build all services that have a build.sh script`;
}

export function main() {
  try {
    const services = getServices();
    const buildableServices = Object.keys(services).filter(name => {
      const buildScript = path.join(services[name].path, 'build.sh');
      return fs.existsSync(buildScript);
    });

    if (buildableServices.length === 0) {
      logger.info('No services with build.sh scripts found');
      process.exit(0);
    }

    logger.section(`Building ${buildableServices.length} service(s)`);

    for (const serviceName of buildableServices) {
      const service = services[serviceName];
      const buildScript = path.join(service.path, 'build.sh');

      logger.log(`\n→ Building ${serviceName}...`);

      execSync('bash build.sh', {
        cwd: service.path,
        stdio: 'inherit',
        env: process.env
      });

      logger.success(`${serviceName} built`);
    }

    logger.section(`✓ All ${buildableServices.length} service(s) built successfully`);
  } catch (err) {
    logger.fatal(err.message);
  }
}

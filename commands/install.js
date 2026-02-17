import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getServices } from '../utils/modules.js';
import * as logger from '../utils/logger.js';

export function help() {
  return `pnpm run dx install
  Install all services that have an install.sh script`;
}

export function main() {
  try {
    const services = getServices();
    const installableServices = Object.keys(services).filter(name => {
      const installScript = path.join(services[name].path, 'install.sh');
      return fs.existsSync(installScript);
    });

    if (installableServices.length === 0) {
      logger.info('No services with install.sh scripts found');
      process.exit(0);
    }

    logger.section(`Installing ${installableServices.length} service(s)`);

    for (const serviceName of installableServices) {
      const service = services[serviceName];
      const installScript = path.join(service.path, 'install.sh');

      logger.log(`\n→ Installing ${serviceName}...`);

      execSync('bash install.sh', {
        cwd: service.path,
        stdio: 'inherit',
        env: process.env
      });

      logger.success(`${serviceName} installed`);
    }

    logger.section(`✓ All ${installableServices.length} service(s) installed successfully`);
  } catch (err) {
    logger.fatal(err.message);
  }
}

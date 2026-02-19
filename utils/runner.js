/**
 * Shared runner logic for service commands like build and install.
 * Handles service/module resolution, script detection, and arg forwarding.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { getService, getModuleServices, listServices, listModules } from './modules.js';
import * as logger from './logger.js';

/**
 * Run a command for a single service.
 * Prefers the shell script if present; falls back to pnpm; skips or fails if neither exists.
 *
 * @param {string} name - Service name
 * @param {object} opts
 * @param {string} opts.script   - Shell script filename, e.g. 'build.sh'
 * @param {string} opts.pnpmCmd  - pnpm subcommand, e.g. 'build' or 'install'
 * @param {string} opts.label    - Human label for log messages, e.g. 'build'
 * @param {string[]} opts.extraArgs - Extra args to forward
 * @param {boolean} opts.strict  - If true, throw when no steps found; otherwise log and skip
 */
export function runForService(name, { script, pnpmCmd, label, extraArgs = [], strict = false }) {
  const service = getService(name);
  const scriptPath = path.join(service.path, script);
  const packageJson = path.join(service.path, 'package.json');
  const extra = extraArgs.join(' ');

  if (fs.existsSync(scriptPath)) {
    logger.log(`${label} ${name} (${script})...`);
    execSync(`bash ${script}${extra ? ` ${extra}` : ''}`, { cwd: service.path, stdio: 'inherit', env: process.env });
  } else if (fs.existsSync(packageJson)) {
    let pkgName = name;
    try {
      pkgName = JSON.parse(fs.readFileSync(packageJson, 'utf-8')).name || name;
    } catch {
      // If we can't read/parse, use directory name as fallback
    }
    logger.log(`${label} ${name} (pnpm)...`);
    execSync(`pnpm --filter="${pkgName}" ${pnpmCmd}${extra ? ` -- ${extra}` : ''}`, { stdio: 'inherit', env: process.env });
  } else if (strict) {
    throw new Error(`Service "${name}" has no ${label} steps (no ${script} or package.json)`);
  } else {
    logger.info(`Skipping ${name} (no ${label} steps)`);
  }
}

/**
 * Parse args, resolve service/module, and run the command.
 * Modules and no-filter runs are non-strict; direct service calls are strict.
 *
 * @param {string[]} args - Raw CLI args (may include '--' separator)
 * @param {object} opts
 * @param {string} opts.script   - Shell script filename
 * @param {string} opts.pnpmCmd  - pnpm subcommand
 * @param {string} opts.label    - Human label
 */
export function runCommand(args, { script, pnpmCmd, label }) {
  const separatorIdx = args.indexOf('--');
  const positional = separatorIdx === -1 ? args : args.slice(0, separatorIdx);
  const extraArgs = separatorIdx === -1 ? [] : args.slice(separatorIdx + 1);
  // Flags (--something) are not service/module names; treat as no filter
  const name = positional[0]?.startsWith('-') ? undefined : positional[0];
  const opts = { script, pnpmCmd, label, extraArgs };

  if (! name) {
    for (const svcName of listServices()) {
      runForService(svcName, { ...opts, strict: false });
    }
    return;
  }

  const modules = listModules();
  const services = listServices();

  if (modules.includes(name)) {
    const serviceNames = getModuleServices(name);
    logger.section(`${label} ${serviceNames.length} service(s) for module "${name}"`);
    for (const svcName of serviceNames) {
      runForService(svcName, { ...opts, strict: false });
    }
  } else if (services.includes(name)) {
    runForService(name, { ...opts, strict: true });
  } else {
    logger.fatal(`Unknown service or module: "${name}"`);
  }
}

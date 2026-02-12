/**
 * CLI Logger
 * Handles colored and formatted output for better UX
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Format and log info message
 */
export function info(message) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

/**
 * Format and log success message
 */
export function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

/**
 * Format and log warning message
 */
export function warn(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Format and log error message
 */
export function error(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

/**
 * Format and log debug message
 */
export function debug(message) {
  if (process.env.DEBUG) {
    console.log(`${colors.dim}[DEBUG]${colors.reset} ${message}`);
  }
}

/**
 * Print section header
 */
export function section(title) {
  console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}\n`);
}

/**
 * Print key-value pair
 */
export function pair(key, value) {
  console.log(`  ${colors.dim}${key}${colors.reset} ${value}`);
}

/**
 * Print raw output (no formatting)
 */
export function log(message) {
  console.log(message);
}

/**
 * Exit with error
 */
export function fatal(message) {
  error(message);
  process.exit(1);
}

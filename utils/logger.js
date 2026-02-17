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
 * Replace 'pnpm run dx' with DX_EXECUTOR if set
 */
function formatMessage(message) {
  if (process.env.DX_EXECUTOR) {
    return message.replace(/pnpm run dx/g, process.env.DX_EXECUTOR);
  }
  return message;
}

/**
 * Format and log info message
 */
export function info(message) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${formatMessage(message)}`);
}

/**
 * Format and log success message
 */
export function success(message) {
  console.log(`${colors.green}✓${colors.reset} ${formatMessage(message)}`);
}

/**
 * Format and log warning message
 */
export function warn(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${formatMessage(message)}`);
}

/**
 * Format and log error message
 */
export function error(message) {
  console.error(`${colors.red}✗${colors.reset} ${formatMessage(message)}`);
}

/**
 * Format and log debug message
 */
export function debug(message) {
  if (process.env.DEBUG) {
    console.log(`${colors.dim}[DEBUG]${colors.reset} ${formatMessage(message)}`);
  }
}

/**
 * Print section header
 */
export function section(title) {
  console.log(`\n${colors.bright}${colors.blue}${formatMessage(title)}${colors.reset}\n`);
}

/**
 * Print key-value pair
 */
export function pair(key, value) {
  console.log(`  ${colors.dim}${formatMessage(key)}${colors.reset} ${formatMessage(value)}`);
}

/**
 * Print raw output (no formatting)
 */
export function log(message) {
  console.log(formatMessage(message));
}

/**
 * Exit with error
 */
export function fatal(message) {
  error(message);
  process.exit(1);
}

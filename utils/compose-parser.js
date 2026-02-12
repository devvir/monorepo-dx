import fs from 'node:fs';

/**
 * Parse image and port from docker compose file
 * @param {string} composePath - Path to compose.yml
 * @returns {Object} { image, port }
 */
export function parseComposeFile(composePath) {
  const content = readComposeFile(composePath);

  if (!content) {
    return { image: undefined, port: undefined };
  }

  const imageMatch = content.match(/image:\s*\$?\{?([^}$\n]+)\}?/);
  const portMatch = content.match(/ports:\s*\n\s*-\s*['"]*\$?\{[^}]*:-(\d+)\}/);

  return {
    image: imageMatch?.[1].trim(),
    port: portMatch ? parseInt(portMatch[1], 10) : undefined
  };
}

/**
 * Extract service names from module compose.yml include directives
 * @param {string} composePath - Path to module's compose.yml
 * @returns {string[]} Array of service names
 */
export function parseModuleServices(composePath) {
  const content = readComposeFile(composePath);
  if (! content) return [];

  const includeMatches = content.match(/include:\s*\n([\s\S]*?)(?=\n[a-z]|\n*$)/i);
  if (! includeMatches) return [];

  const services = [];
  const lines = includeMatches[1].split('\n');

  for (const line of lines) {
    const match = line.match(/\/services\/([^/]+)\//);

    if (match) {
      const serviceName = match[1];

      if (! services.includes(serviceName)) {
        services.push(serviceName);
      }
    }
  }

  return services;
}

/**
 * Read docker compose file content
 * @param {string} composePath - Path to compose.yml
 * @returns {string|null} File content or null on error
 */
function readComposeFile(composePath) {
  try {
    return fs.readFileSync(composePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

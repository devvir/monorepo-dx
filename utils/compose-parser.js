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
 * Extract service names from module compose.yml (include and extends directives)
 * @param {string} composePath - Path to module's compose.yml
 * @returns {string[]} Array of service names
 */
export function parseModuleServices(composePath) {
  const content = readComposeFile(composePath);
  if (! content) return [];

  const services = new Set();

  // Extract services from include directives
  const includeMatches = content.match(/include:\s*\n([\s\S]*?)(?=\n[a-z]|\n*$)/i);
  if (includeMatches) {
    const lines = includeMatches[1].split('\n');

    for (const line of lines) {
      const match = line.match(/\/services\/([^/]+)\//);

      if (match) {
        services.add(match[1]);
      }
    }
  }

  // Extract services from extends directives (to capture application services)
  const extendsMatches = content.matchAll(/file:\s*\.\.\/\.\.\/services\/([^/]+)\//g);
  for (const match of extendsMatches) {
    services.add(match[1]);
  }

  return Array.from(services);
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

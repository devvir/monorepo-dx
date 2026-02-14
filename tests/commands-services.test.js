import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock logger to capture output
let logOutput = [];
vi.mock('../utils/logger.js', () => ({
  section: vi.fn((msg) => logOutput.push(msg)),
  log: vi.fn((msg) => logOutput.push(msg)),
  warn: vi.fn((msg) => logOutput.push(msg)),
  fatal: vi.fn(() => { throw new Error('Fatal error'); })
}));

// Mock modules utils to use test fixtures
vi.mock('../utils/modules.js', () => {
  const fixturesPath = path.join(__dirname, 'fixtures', 'services');

  return {
    getServices: vi.fn(() => ({
      testapp: {
        path: path.join(fixturesPath, 'testapp'),
        description: 'Test application service',
        infrastructure: false,
        port: 3000,
        image: 'node:18'
      },
      testinfra: {
        path: path.join(fixturesPath, 'testinfra'),
        description: 'PostgreSQL database',
        infrastructure: true,
        port: 5432,
        image: 'postgres:14'
      }
    })),
    listServices: vi.fn(() => ['testapp', 'testinfra'])
  };
});

describe('services command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logOutput = [];
  });

  describe('help()', () => {
    it('should export a help function', async () => {
      const servicesCommand = await import('../commands/services.js');
      expect(typeof servicesCommand.help).toBe('function');
    });

    it('should return a string', async () => {
      const servicesCommand = await import('../commands/services.js');
      const help = servicesCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention services', async () => {
      const servicesCommand = await import('../commands/services.js');
      const help = servicesCommand.help();
      expect(help.toLowerCase()).toContain('service');
    });
  });

  describe('main()', () => {
    it('should export a main function', async () => {
      const servicesCommand = await import('../commands/services.js');
      expect(typeof servicesCommand.main).toBe('function');
    });

    it('should list all available services', async () => {
      const servicesCommand = await import('../commands/services.js');
      const { listServices } = await import('../utils/modules.js');

      servicesCommand.main();

      // Verify listServices was called
      expect(listServices).toHaveBeenCalled();

      // Verify output contains service names
      const output = logOutput.join(' ');
      expect(output.toLowerCase()).toContain('testapp');
      expect(output.toLowerCase()).toContain('testinfra');
    });

    it('should display service descriptions', async () => {
      const servicesCommand = await import('../commands/services.js');

      servicesCommand.main();

      const output = logOutput.join(' ');
      expect(output).toContain('Test application service');
      expect(output).toContain('PostgreSQL database');
    });

    it('should mark infrastructure services', async () => {
      const servicesCommand = await import('../commands/services.js');

      servicesCommand.main();

      const output = logOutput.join(' ');
      // testinfra should be marked as infrastructure
      expect(output).toContain('[infra]');
    });

    it('should handle empty service list', async () => {
      const { listServices } = await import('../utils/modules.js');
      const { warn } = await import('../utils/logger.js');

      // Mock empty service list
      listServices.mockReturnValue([]);

      const servicesCommand = await import('../commands/services.js');
      servicesCommand.main();

      // Should warn about no services found
      expect(warn).toHaveBeenCalledWith('No services found');
    });
  });
});

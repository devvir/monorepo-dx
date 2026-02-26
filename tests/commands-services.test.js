import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let logOutput = [];
vi.mock('../utils/logger.js', () => ({
  section: vi.fn((msg) => logOutput.push(msg)),
  log: vi.fn((msg) => logOutput.push(msg)),
  warn: vi.fn((msg) => logOutput.push(msg)),
  fatal: vi.fn(() => { throw new Error('Fatal error'); })
}));

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

  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/services.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('should export an action function', async () => {
      const cmd = await import('../commands/services.js');
      expect(typeof cmd.action).toBe('function');
    });

    it('should list all available services', async () => {
      const cmd = await import('../commands/services.js');
      const { listServices } = await import('../utils/modules.js');

      cmd.action();

      expect(listServices).toHaveBeenCalled();

      const output = logOutput.join(' ');
      expect(output.toLowerCase()).toContain('testapp');
      expect(output.toLowerCase()).toContain('testinfra');
    });

    it('should display service descriptions', async () => {
      const cmd = await import('../commands/services.js');
      cmd.action();

      const output = logOutput.join(' ');
      expect(output).toContain('Test application service');
      expect(output).toContain('PostgreSQL database');
    });

    it('should mark infrastructure services', async () => {
      const cmd = await import('../commands/services.js');
      cmd.action();

      const output = logOutput.join(' ');
      expect(output).toContain('[infra]');
    });

    it('should handle empty service list', async () => {
      const { listServices } = await import('../utils/modules.js');
      const { warn } = await import('../utils/logger.js');

      listServices.mockReturnValue([]);

      const cmd = await import('../commands/services.js');
      cmd.action();

      expect(warn).toHaveBeenCalledWith('No services found');
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';

vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

vi.mock('../utils/logger.js', () => ({
  section: vi.fn(),
  log: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  fatal: vi.fn(() => { throw new Error('Fatal error'); })
}));

vi.mock('../utils/modules.js', () => ({
  getServices: vi.fn(() => ({
    testapp: {
      path: '/mock/services/testapp',
      description: 'Test application',
      hasPackageJson: true
    },
    testinfra: {
      path: '/mock/services/testinfra',
      description: 'Test infrastructure',
      hasPackageJson: false
    }
  })),
  getService: vi.fn((name) => {
    const services = {
      testapp: {
        path: '/mock/services/testapp',
        description: 'Test application',
        hasPackageJson: true
      },
      testinfra: {
        path: '/mock/services/testinfra',
        description: 'Test infrastructure',
        hasPackageJson: false
      }
    };
    if (! services[name]) {
      throw new Error(`Unknown service: ${name}`);
    }
    return services[name];
  }),
  getModuleServices: vi.fn((moduleName) => {
    if (moduleName === 'testmod') {
      return ['testapp', 'testinfra'];
    }
    throw new Error(`Unknown module: ${moduleName}`);
  })
}));

vi.mock('../utils/metadata.js', () => ({
  hasNpmScript: vi.fn((service, scriptName) => {
    return service.path === '/mock/services/testapp' && scriptName === 'test';
  })
}));

describe('test command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    execSync.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const testCommand = await import('../commands/test.js');
      expect(typeof testCommand.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('should export an action function', async () => {
      const testCommand = await import('../commands/test.js');
      expect(typeof testCommand.action).toBe('function');
    });

    it('should run tests for all services with test scripts when no args', async () => {
      const testCommand = await import('../commands/test.js');
      await testCommand.action(undefined, {});

      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(
        'pnpm run test',
        expect.objectContaining({
          cwd: '/mock/services/testapp',
          stdio: 'inherit'
        })
      );
    });

    it('should run tests for specific service', async () => {
      const testCommand = await import('../commands/test.js');
      await testCommand.action('testapp', {});

      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(
        'pnpm run test',
        expect.objectContaining({
          cwd: '/mock/services/testapp'
        })
      );
    });

    it('should run tests for module services when -m flag provided', async () => {
      const testCommand = await import('../commands/test.js');
      await testCommand.action(undefined, { module: 'testmod' });

      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(
        'pnpm run test',
        expect.objectContaining({
          cwd: '/mock/services/testapp'
        })
      );
    });
  });
});

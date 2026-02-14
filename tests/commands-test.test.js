import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';

// Mock child_process to prevent actual command execution
vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

// Mock logger to prevent console output during tests
vi.mock('../utils/logger.js', () => ({
  section: vi.fn(),
  log: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  fatal: vi.fn(() => { throw new Error('Fatal error'); })
}));

// Mock modules utils to return fixture data
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

// Mock metadata utils
vi.mock('../utils/metadata.js', () => ({
  hasNpmScript: vi.fn((service, scriptName) => {
    // Only testapp has npm scripts
    return service.path === '/mock/services/testapp' && scriptName === 'test';
  })
}));

describe('test command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful test execution by default
    execSync.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('help()', () => {
    it('should export a help function', async () => {
      const testCommand = await import('../commands/test.js');
      expect(typeof testCommand.help).toBe('function');
    });

    it('should return a string', async () => {
      const testCommand = await import('../commands/test.js');
      const help = testCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention test', async () => {
      const testCommand = await import('../commands/test.js');
      const help = testCommand.help();
      expect(help.toLowerCase()).toContain('test');
    });

    it('should document the -m flag', async () => {
      const testCommand = await import('../commands/test.js');
      const help = testCommand.help();
      expect(help).toContain('-m');
    });
  });

  describe('main()', () => {
    it('should export a main function', async () => {
      const testCommand = await import('../commands/test.js');
      expect(typeof testCommand.main).toBe('function');
    });

    it('should run tests for all services with test scripts when no args provided', async () => {
      const testCommand = await import('../commands/test.js');

      // Override process.argv for this test
      const originalArgv = process.argv;
      process.argv = ['node', 'dx.js'];

      await testCommand.main();

      // Should have called execSync for testapp (has test script)
      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(
        'npm run test',
        expect.objectContaining({
          cwd: '/mock/services/testapp',
          stdio: 'inherit'
        })
      );

      process.argv = originalArgv;
    });

    it('should run tests for specific service when service name provided', async () => {
      const testCommand = await import('../commands/test.js');

      const originalArgv = process.argv;
      process.argv = ['node', 'dx.js', 'testapp'];

      await testCommand.main();

      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(
        'npm run test',
        expect.objectContaining({
          cwd: '/mock/services/testapp'
        })
      );

      process.argv = originalArgv;
    });

    it('should run tests for all services in module when -m flag provided', async () => {
      const testCommand = await import('../commands/test.js');

      const originalArgv = process.argv;
      process.argv = ['node', 'dx.js', '-m', 'testmod'];

      await testCommand.main();

      // Should run tests for testapp (testinfra has no test script)
      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync).toHaveBeenCalledWith(
        'npm run test',
        expect.objectContaining({
          cwd: '/mock/services/testapp'
        })
      );

      process.argv = originalArgv;
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child_process to capture docker commands
vi.mock('node:child_process', () => ({
  execSync: vi.fn()
}));

// Mock logger
vi.mock('../utils/logger.js', () => ({
  section: vi.fn(),
  pair: vi.fn(),
  fatal: vi.fn(() => { throw new Error('Fatal error'); })
}));

// Mock docker utils
vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

// Mock modules utils
vi.mock('../utils/modules.js', () => ({
  getModule: vi.fn((name) => {
    if (name === 'testmod') {
      return {
        name: 'testmod',
        description: 'Test module',
        services: ['testapp', 'testinfra']
      };
    }
    if (name === '.') {
      return {
        name: '.',
        description: 'Full application',
        services: ['testapp', 'testinfra', 'otherapp']
      };
    }
    throw new Error(`Unknown module: ${name}`);
  }),
  listModules: vi.fn(() => ['testmod', 'othermod'])
}));

describe('up command', () => {
  let parseCommandArgs;
  let runDockerCommand;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked functions
    const dockerUtils = await import('../utils/docker.js');
    parseCommandArgs = dockerUtils.parseCommandArgs;
    runDockerCommand = dockerUtils.runDockerCommand;

    // Default mock implementation
    parseCommandArgs.mockReturnValue({
      module: 'testmod',
      composeArgs: [],
      moduleConfig: {
        name: 'testmod',
        description: 'Test module',
        services: ['testapp', 'testinfra']
      }
    });
  });

  describe('help()', () => {
    it('should export a help function', async () => {
      const upCommand = await import('../commands/up.js');
      expect(typeof upCommand.help).toBe('function');
    });

    it('should return a string', async () => {
      const upCommand = await import('../commands/up.js');
      const help = upCommand.help();
      expect(typeof help).toBe('string');
    });

    it('should mention starting services', async () => {
      const upCommand = await import('../commands/up.js');
      const help = upCommand.help();
      expect(help.toLowerCase()).toContain('up');
    });
  });

  describe('main()', () => {
    it('should export a main function', async () => {
      const upCommand = await import('../commands/up.js');
      expect(typeof upCommand.main).toBe('function');
    });

    it('should call runDockerCommand with module and up command', async () => {
      const upCommand = await import('../commands/up.js');

      parseCommandArgs.mockReturnValue({
        module: 'testmod',
        composeArgs: [],
        moduleConfig: {
          name: 'testmod',
          description: 'Test module',
          services: ['testapp', 'testinfra']
        }
      });

      upCommand.main();

      // Verify runDockerCommand was called correctly
      expect(runDockerCommand).toHaveBeenCalledTimes(1);
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', []);
    });

    it('should pass compose args to runDockerCommand', async () => {
      const upCommand = await import('../commands/up.js');

      parseCommandArgs.mockReturnValue({
        module: 'testmod',
        composeArgs: ['-d', '--build'],
        moduleConfig: {
          name: 'testmod',
          description: 'Test module',
          services: ['testapp', 'testinfra']
        }
      });

      upCommand.main();

      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', ['-d', '--build']);
    });

    it('should handle full application module', async () => {
      const upCommand = await import('../commands/up.js');

      parseCommandArgs.mockReturnValue({
        module: null,
        composeArgs: [],
        moduleConfig: {
          name: null,
          description: 'Full application',
          services: ['testapp', 'testinfra', 'otherapp']
        }
      });

      upCommand.main();

      expect(runDockerCommand).toHaveBeenCalledWith(null, 'up', []);
    });

    it('should handle single service within module', async () => {
      const upCommand = await import('../commands/up.js');

      parseCommandArgs.mockReturnValue({
        module: 'testmod',
        composeArgs: ['testapp'],
        moduleConfig: {
          name: 'testmod',
          description: 'Test module',
          services: ['testapp', 'testinfra']
        }
      });

      upCommand.main();

      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', ['testapp']);
    });
  });
});

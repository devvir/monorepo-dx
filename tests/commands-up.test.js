import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  section: vi.fn(),
  pair: vi.fn(),
  success: vi.fn(),
  fatal: vi.fn(() => { throw new Error('Fatal error'); })
}));

vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

vi.mock('../utils/runner.js', () => ({
  runForTarget: vi.fn()
}));

describe('up command', () => {
  let parseCommandArgs;
  let runDockerCommand;
  let runForTarget;

  beforeEach(async () => {
    vi.clearAllMocks();

    const dockerUtils = await import('../utils/docker.js');
    parseCommandArgs = dockerUtils.parseCommandArgs;
    runDockerCommand = dockerUtils.runDockerCommand;

    const runner = await import('../utils/runner.js');
    runForTarget = runner.runForTarget;

    parseCommandArgs.mockReturnValue({
      module: 'testmod',
      composeArgs: [],
      moduleConfig: {
        description: 'Test module',
        services: ['testapp', 'testinfra']
      }
    });
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const upCommand = await import('../commands/up.js');
      expect(typeof upCommand.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('should export an action function', async () => {
      const upCommand = await import('../commands/up.js');
      expect(typeof upCommand.action).toBe('function');
    });

    it('should call runDockerCommand with module and up command', async () => {
      const upCommand = await import('../commands/up.js');
      upCommand.action(['testmod'], {});

      expect(runDockerCommand).toHaveBeenCalledTimes(1);
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', []);
    });

    it('should pass compose args to runDockerCommand', async () => {
      parseCommandArgs.mockReturnValue({
        module: 'testmod',
        composeArgs: ['-d', '--build'],
        moduleConfig: {
          description: 'Test module',
          services: ['testapp', 'testinfra']
        }
      });

      const upCommand = await import('../commands/up.js');
      upCommand.action(['testmod', '-d', '--build'], {});

      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', ['-d', '--build']);
    });

    it('should handle full application module', async () => {
      parseCommandArgs.mockReturnValue({
        module: null,
        composeArgs: [],
        moduleConfig: null
      });

      const upCommand = await import('../commands/up.js');
      upCommand.action([], {});

      expect(runDockerCommand).toHaveBeenCalledWith(null, 'up', []);
    });

    it('should handle single service within module', async () => {
      parseCommandArgs.mockReturnValue({
        module: 'testmod',
        composeArgs: ['testapp'],
        moduleConfig: {
          description: 'Test module',
          services: ['testapp', 'testinfra']
        }
      });

      const upCommand = await import('../commands/up.js');
      upCommand.action(['testmod', 'testapp'], {});

      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', ['testapp']);
    });

    it('should run install and build when -i flag is set', async () => {
      const upCommand = await import('../commands/up.js');
      upCommand.action(['testmod'], { install: true });

      expect(runForTarget).toHaveBeenCalledWith('testmod', expect.objectContaining({
        label: 'Installing',
        pnpmCmd: 'install'
      }));
      expect(runForTarget).toHaveBeenCalledWith('testmod', expect.objectContaining({
        label: 'Building',
        pnpmCmd: 'build'
      }));
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', []);
    });

    it('should not run install and build without -i flag', async () => {
      const upCommand = await import('../commands/up.js');
      upCommand.action(['testmod'], {});

      expect(runForTarget).not.toHaveBeenCalled();
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'up', []);
    });
  });
});

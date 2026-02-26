import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  section: vi.fn(),
  log: vi.fn(),
  error: vi.fn()
}));

vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

describe('config command', () => {
  let parseCommandArgs;
  let runDockerCommand;

  beforeEach(async () => {
    vi.clearAllMocks();
    const dockerUtils = await import('../utils/docker.js');
    parseCommandArgs = dockerUtils.parseCommandArgs;
    runDockerCommand = dockerUtils.runDockerCommand;

    parseCommandArgs.mockReturnValue({
      module: 'testmod',
      composeArgs: [],
      moduleConfig: { description: 'Test module' }
    });
    runDockerCommand.mockReturnValue('resolved-config-output');
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/config.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('should export an action function', async () => {
      const cmd = await import('../commands/config.js');
      expect(typeof cmd.action).toBe('function');
    });

    it('calls runDockerCommand with config and capture=true', async () => {
      const cmd = await import('../commands/config.js');
      cmd.action(['testmod']);
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'config', [], true);
    });

    it('handles null module gracefully', async () => {
      parseCommandArgs.mockReturnValue({
        module: null,
        composeArgs: [],
        moduleConfig: null
      });
      const cmd = await import('../commands/config.js');
      cmd.action([]);
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'config', [], true);
    });
  });
});

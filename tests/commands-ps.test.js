import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  error: vi.fn()
}));

vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

describe('ps command', () => {
  let parseCommandArgs;
  let runDockerCommand;

  beforeEach(async () => {
    vi.clearAllMocks();
    const dockerUtils = await import('../utils/docker.js');
    parseCommandArgs = dockerUtils.parseCommandArgs;
    runDockerCommand = dockerUtils.runDockerCommand;

    parseCommandArgs.mockReturnValue({
      module: null,
      composeArgs: [],
      moduleConfig: null
    });
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/ps.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('calls runDockerCommand with ps', async () => {
      const cmd = await import('../commands/ps.js');
      cmd.action([]);
      expect(runDockerCommand).toHaveBeenCalledWith(null, 'ps', []);
    });

    it('calls runDockerCommand with specific module when provided', async () => {
      parseCommandArgs.mockReturnValue({
        module: 'mymodule',
        composeArgs: [],
        moduleConfig: { description: 'MyModule' }
      });
      const cmd = await import('../commands/ps.js');
      cmd.action(['mymodule']);
      expect(runDockerCommand).toHaveBeenCalledWith('mymodule', 'ps', []);
    });
  });
});

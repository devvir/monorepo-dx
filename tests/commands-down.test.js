import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../utils/logger.js', () => ({
  section: vi.fn(),
  pair: vi.fn(),
  success: vi.fn(),
  error: vi.fn()
}));

vi.mock('../utils/docker.js', () => ({
  parseCommandArgs: vi.fn(),
  runDockerCommand: vi.fn()
}));

describe('down command', () => {
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
      moduleConfig: { description: 'Test module', services: ['app1'] }
    });
  });

  describe('register()', () => {
    it('should export a register function', async () => {
      const cmd = await import('../commands/down.js');
      expect(typeof cmd.register).toBe('function');
    });
  });

  describe('action()', () => {
    it('calls runDockerCommand with down and the module', async () => {
      const cmd = await import('../commands/down.js');
      cmd.action(['testmod']);
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'down', []);
    });

    it('forwards compose args to runDockerCommand', async () => {
      parseCommandArgs.mockReturnValue({
        module: 'testmod',
        composeArgs: ['-v', '--remove-orphans'],
        moduleConfig: { description: 'Test module', services: [] }
      });
      const cmd = await import('../commands/down.js');
      cmd.action(['testmod', '-v', '--remove-orphans']);
      expect(runDockerCommand).toHaveBeenCalledWith('testmod', 'down', ['-v', '--remove-orphans']);
    });
  });
});
